Specification
===

This extension can be used in 3 different ways:

- **[Keycloak Sign Endpoint](#1-Keycloak-Sign-Endpoint)**: The minimal way is sending the necessary data to the sign endpoint.
- **[Custom Element](#2-Custom-Element)**: Using the `<keycloak-signature>` web component which accepts the credentials of the user and calls the POST [Keycloak Sign Endpoint](#1-Keycloak-Sign-Endpoint).
- **[Keycloak Page](#3-Keycloak-Page)**: Integrates the `<keycloak-signature>` [custom element](#2-Custom-Element) to provide signing functionality.


We split the realization of the extension in the following sections:


## 1. Keycloak Sign Endpoint


### API Definition

```yaml=
openapi: 3.0.3
info:
  title: Keycloak Signature Extension
  description: |-
    Keycloak Signature Extension REST API's
  version: 1.0.0
paths:
  /realms/realm1/signature/sign:
    post:
      tags:
        - signing
      summary: Get signed JWT
      description: Get signed JWT from Keycloak
      operationId: signPayload
      parameters:
        - in: header
          name: Host
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                payload:
                  type: string
                credentials:
                  type: object
                  additionalProperties: 
                    type: string

      security:
        - keycloakIdentity: []
      responses:
        '200':
          description: Returns the signedPayload
          content:
            application/json:
              schema:
                type: object
                properties:
                  signedPayload:
                    type: string      
        '403':
          description: Forbidden
          
components:
  securitySchemes:
    keycloakIdentity:
      type: apiKey
      in: cookie
      name: KEYCLOAK_IDENTITY  
```

**Request:**

This endpoint expects an Keycloak Identity Cookie (which means the user has to be a valid session) and a request body which contains the payload and credentials as JSON.

- `KEYCLOAK_IDENTITY`: This Session Cookie will be used to identify the user and validate the current session.
- `payload`: String value which is going to be inserted into the JWT. We recommend you to encode your payload into  **Base64**.
- `credentials`: Object containing authentication method (e.g. password) and its corresponding credential value in order to verify the user.

**Response:**

In case of valid session and credentials, Keycloak will return a 200 response with the signature in the body (`signedPayload=JWT)`. You can find more information about the signature and its structure [here](#SignedPayload).

Keycloak will return a 403 if the credentials are not valid.


### Example

**Request**

```
POST /realms/realm1/signature/sign/ HTTP/1.1
Host: server.example.com
Content-Type: application/json
Cookie: KEYCLOAK_IDENTITY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

{
    "payload": "xyz"
    "credentials": {
        "password": "abc"
    }
}
```

**Response OK**
```
HTTP/1.1 200 OK
Content-Type: application/json

{
   "signedPayload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
  ``` 

**Response Unauthorized**

```
HTTP/1.1 403 Forbidden  
```

### SignedPayload

When the received credentials are valid then Keycloak will create a [JSON Web Token](https://jwt.io/introduction) (JWT) which includes the following key-value pairs (with example values):


```
{
  "payload": "xyz",
  "username": "user@inventage.com",
  "credential": "password",
  "iat": 18977474,
  "iss": "http://localhost:8080/realms/master" ,
  "jti": "ca6b138c-60e9-4ce7-b06f-d2a21afdb9d1",
  "sub": "313e54eb-7d66-466d-8653-195d8017c06e",
  "typ": "signed-payload-token",
  "nonce": "ca6b138c-60e9-4ce7-b06f-d2a21afdb9d1"
}
```

- `payload`: String parameter received during calling the `/sign` endpoint.
- `username`: Username of the user who issued the signing process
- `credential`: Used authentication method for validating the user
- `iat`: (issued at) Unix timestamp of JWT creation
- `iss`: (Issuer) Creater and Signer of this JWT
- `jti`: (JWT ID) Unique identifier of this JWT
- `sub`: (subject) to whom the JWT refers
- `typ`: Type of JWT
- `nonce`: Unique value linking a request to a token

The JWT will be singed with the private key of Keycloak (asymmertic signing).
The default signing algorithm is **RS256**, however it can be configured with `defaultSignatureAlgorithm` property in the realm JSON configuration file.


## 2. Custom Element

This extension also provides a `<keycloak-signature>` [custom element](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements).

![](https://hedgedoc.inventage.com/uploads/6b597a4f-49c8-49c9-9be1-ad3e0aae66b4.png)



The [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) is structured as follows:

1. Has a title
2. Renders what is provided in the `<slot>` element
3. Includes elements necessary for authentication (e.g. password input)
4. Provides an accept button
5. Provides a reject button

### API

#### Properties

| Property              | Attribute                 | Type     | Default                         | Description                                                                                                                                                                                                        |
| --------------------- | ------------------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `payload`             | `payload`                 | `string` | ""                              | The payload which is going to be signed by Keycloak. If an invalid payload is given (e.g. empty string, `undefined` value etc.), the component does not render anything and logs a warning to the browser console. |
| `signEndpoint`        | `sign-endpoint`           | `string` | "/realms/master/signature/sign" | The API endpoint used for signing                                                                                                                                                                                  |
| `titleText`           | `title`                   | `string` | "Keycloak Signature Extension"  | Text of the title displayed on the top of the component                                                                                                                                                            |
| `acceptText`          | `accept`                  | `string` | "Accept"                        | Text of the accept button                                                                                                                                                                                          |
| `rejectText`          | `reject`                  | `string` | "Reject"                        | Text of the reject button                                                                                                                                                                                          |
| `maxNrOfAuthAttempts` | `max-nr-of-auth-attempts` | `number` | 3                               | Maximal number of authentication attempts                                                                                                                                                                          |


#### Slots

| Name | Description                                                  |
| ---- | ------------------------------------------------------------ |
|      | Default content placed inside the main body of the component |

#### Events

| Event      | Type                                     | Description                                                                                                                                                                                                                                     |
| ---------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signed`   | `CustomEvent<{ signedPayload: string }>` | Dispatched when the given payload has successfully been signed. The event contains the value of signedPayload from the API response.                                                                                                            |
| `failed`   | `CustomEvent<{ reason: string }>`        | Dispatched when signing the payload has failed. The event contains the reason (decription) of the failure. Following reasons are available: `credentials-wrong`, `max-nr-of-auth-attempts-exceeded`, `credentials-empty` and `unexpected-error` |
| `rejected` | `CustomEvent`                            | Dispatched when the reject button is pressed                                                                                                                                                                                                    |



#### CSS Shadow Parts


| Part            | Description                          |
| --------------- | ------------------------------------ |
| `title`         | Representing the title               |
| `password`      | Representing the password            |
| `message-text`  | Representing the text of the message |
| `accept-button` | Representing the accept button       |
| `reject-button` | Representing the reject button       |

**Example**

```htmlbars=
<style>
      keycloak-signature::part(title) {
        margin-top: 0;
        color: green;
      }
</style>
```


#### CSS Custom Properties

**Title**

| Property                                 | Description                           | Type        | Default |
| ---------------------------------------- | ------------------------------------- | ----------- | ------- |
| `--keycloak-signature-title-font-size`   | Controls the font size of the title   | font size   | `2rem`  |
| `--keycloak-signature-title-font-weight` | Controls the font weight of the title | font weight | `bold`  |
| `--keycloak-signature-title-color`       | Controls the color of the title       | color       | `black` |

**Password**

| Property                                    | Description                                 | Type        | Default  |
| ------------------------------------------- | ------------------------------------------- | ----------- | -------- |
| `--keycloak-signature-password-font-size`   | Controls the font size of the password size | font size   | `1rem`   |
| `--keycloak-signature-password-font-weight` | Controls the font weight of the password    | font weight | `normal` |
| `--keycloak-signature-password-color`       | Controls the color of the password          | color       | `black`  |

**Accept Button**

| Property                                              | Description                                        | Type        | Default               |
| ----------------------------------------------------- | -------------------------------------------------- | ----------- | --------------------- |
| `--keycloak-signature-accept-button-font-size`        | Controls the font size of the accept button        | font size   | `1rem`                |
| `--keycloak-signature-accept-button-font-weight`      | Controls the font weight of the accept button      | font weight | `normal`              |
| `--keycloak-signature-accept-button-color`            | Controls the color of the accept button            | color       | `black`               |
| `--keycloak-signature-accept-button-background-color` | Controls the background color of the accept button | color       | `white`               |
| `--keycloak-signature-accept-button-border`           | Controls the border of the accept button           | color       | `0.25rem solid green` |
| `--keycloak-signature-accept-button-padding`          | Controls the padding of the accept button          | color       | `0.25rem 0.5rem`      |
| `--keycloak-signature-accept-button-text-align`       | Controls the text alignment of the accept button   | color       | `center`              |
| `--keycloak-signature-accept-button-text-decoration`  | Controls the decoration of the accept button       | color       | `none`                |
| `--keycloak-signature-accept-button-display`          | Controls the display of the accept button          | color       | `inline-block`        |

**Reject Button**

| Property                                              | Description                                        | Type        | Default             |
| ----------------------------------------------------- | -------------------------------------------------- | ----------- | ------------------- |
| `--keycloak-signature-reject-button-font-size`        | Controls the font size of the reject button        | font size   | `1rem`              |
| `--keycloak-signature-reject-button-font-weight`      | Controls the font weight of the reject button      | font weight | `normal`            |
| `--keycloak-signature-reject-button-color`            | Controls the color of the reject button            | color       | `black`             |
| `--keycloak-signature-reject-button-background-color` | Controls the background color of the reject button | color       | `white`             |
| `--keycloak-signature-reject-button-border`           | Controls the border of the reject button           | color       | `0.25rem solid red` |
| `--keycloak-signature-reject-button-padding`          | Controls the padding of the reject button          | color       | `0.25rem 0.5rem`    |
| `--keycloak-signature-reject-button-text-align`       | Controls the text alignment of the reject button   | color       | `center`            |
| `--keycloak-signature-reject-button-text-decoration`  | Controls the decoration of the reject button       | color       | `none`              |
| `--keycloak-signature-reject-button-display`          | Controls the display of the reject button          | color       | `inline-block`      |


**Message Text**

| Property                                  | Description                                       | Type      | Default |
| ----------------------------------------- | ------------------------------------------------- | --------- | ------- |
| `--keycloak-signature-message-text-color` | Controls the color of the text of the message     | color     | `red`   |
| `--keycloak-signature-message-font-size`  | Controls the font size of the text of the message | font size | `1rem`  |

**Example**

```htmlbars=
<style>
      :root {
        --keycloak-signature-title-font-size: 2.25rem;
        --keycloak-signature-title-font-weight: bold;
      }
</style>
```

### Accept

Clicking on the accept button will call the sign endpoint (see [1.](#1-Keycloak-Sign-Endpoint)) with the given payload and credentials. On receiving the response, the event handler will dispatch a `CustomEvent` depending on the received HTTP status code (either `signed` when successful or `failed` when there was a failure).


## 3. Keycloak Page

> [!NOTE]
> **Out of scope**

![](https://hedgedoc.inventage.com/uploads/3d34be0a-dd87-4430-a4d8-fe1bc55060be.png)

TODO: describe query parameters, payload, slot, title, accept, reject, authorization
TODO: KEYCLOAK_IDENTITY token needed in order to validate session

`GET /realms/realm1/signature?payload=...`

This call fetches a page in which the custom element`<keycloak-signature>` is embedded.

## Out of Scope

- Keycloak Page
- Valid domains (for CORS)
- `additonal-properties` --> zusätzlicher JSON Parameter der Webkomponente
- Configure Authentication Method

## Integration Diagrams

### Using Minimum Variant
```mermaid
 sequenceDiagram
    autonumber
    actor User

    User-->>User-Agent: (action) enter Order
    User-Agent->>SPA: (request) /enterOrder
    SPA->>API: (request) /enterOrder
    API->>SPA: (response) 412 Precondition Failed Status
    User-->>User-Agent: (action) enter credentials
    User-Agent->>Keycloak: (request) POST (3.) /sign
    Keycloak->>User-Agent: (response) return signature
    User-Agent->>SPA: (request) /enterOrder with signature 
    SPA->>API: /enterOrder with signature

``` 

### Using <keycloak-signature> Custom Element

```mermaid
 sequenceDiagram
    autonumber
    actor User

    User-->>User-Agent: (action) enter Order
    User-Agent->>SPA: (request) /enterOrder
    SPA->>API: (request) /enterOrder
    API->>SPA: (response) 412 Precondition Failed Status    
    SPA-->>User-Agent: load <keycloak-signature> (1.)
    User-->>User-Agent: (action) enter credentials
    User-Agent->>Keycloak: (request) POST /sign
    Keycloak->>User-Agent: (response) return signature
    User-Agent->>SPA: (request) /enterOrder with signature 
    SPA->>API: /enterOrder with signature
    
```

### Using Keycloak Page

```mermaid
 sequenceDiagram
    autonumber
    actor User

    User-->>User-Agent: (action) enter Order
    User-Agent->>SPA: (request) /enterOrder
    SPA->>API: (request) /enterOrder
    API->>SPA: (response) 412 Precondition Failed Status    
    SPA->>Keycloak: (request) GET (2.) /singature (fetch <keycloak-signature>)
    Keycloak->>User-Agent: (response) requested details and credential html
    User-->>User-Agent: (action) enter credentials
    User-Agent->>Keycloak: (request) POST (3.) /sign
    Keycloak->>User-Agent: (response) return signature
    User-Agent->>SPA: (request) /enterOrder with signature 
    SPA->>API: /enterOrder with signature
    
```

## Archive

![Architecture](https://dl.peschee.me/Untitled-2023-09-04-1428-EHqUXP.png)