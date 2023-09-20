Keycloak Signature Extension
===

The Keycloak Signature Extension gives Keycloak the ability to sign any values, after the user has "re-authenticated" himself. If the credentials are valid, Keycloak will response with a signed JWT including the payload.

Specification
===

> [!NOTE]
> **This document is a draft and is still being edited.**


This extension can be used in 3 different ways:

- **[Keycloak Sign Endpoint](#1-Keycloak-Sign-Endpoint)**: the minimal way is sending the necessary data to the sign endpoint.
- **[Custom Element](#2-Custom-Element)**: Using `<keycloak-signature>` web components which calls the POST [Keycloak Sign Endpoint](#1-Keycloak-Sign-Endpoint).
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
  /realms/master/signature-extension/sign:
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

This endpoint expects an Authorization header and a request body which contains payload and credentials as JSON.

- `KEYCLOAK_IDENTITY`: Keycloak Identity Token of the user (against who the credentials are validated).
- `payload`: String value which is going to be inserted into the JWT. We recommend you to encode your payload into  **Base64**.
- `credentials`: Object containing authentication method (e.g. password) and its corresponding credential value in order to verify the user.

**Response:**

In case of valid credentials, Keycloak will return a 200 response with the signature in the body (`signedPayload=JWT)`. You can find more information about the signature and its structure [here](#SignedPayload).

Keycloak will return a 403 if the credentials are not valid.


### Example

Request:

```
POST /realms/realm1/sign/ HTTP/1.1
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

Response OK:
```
HTTP/1.1 200 OK
Content-Type: application/json

{
   "signedPayload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
}
  ``` 

Response Unauthorized:

```
HTTP/1.1 403 Forbidden  
```

### SignedPayload

When the received credentials are valid then Keycloak will create a [JSON Web Token](https://jwt.io/introduction) (JWT) which includes the following values:


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

![](https://hedgedoc.inventage.com/uploads/7d90197d-0f72-4f69-972c-8c1ee16300ed.png)

The [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) is structured as follows:

1. Has a title
2. Renders what is provided in the `<slot>` element
3. Includes elements necessary for authentication (e.g. password input)
4. Provides an accept button
5. Provides an reject button

### API

#### Properties

| Property              | Attribute                 | Type     | Default                                   | Description                                                                                                                                                                                                        |
| --------------------- | ------------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `payload`             | `payload`                 | `string` | ""                                        | The payload which is going to be signed by Keycloak. If an invalid payload is given (e.g. empty string, `undefined` value etc.), the component does not render anything and logs a warning to the browser console. |
| `signEndpoint`        | `sign-endpoint`           | `string` | "/realms/master/signature-extension/sign" | The API endpoint used for signing                                                                                                                                                                                  |
| `titleText`           | `title`                   | `string` | "Signature"                               | Text of the title displayed on the top of the component                                                                                                                                                            |
| `acceptText`          | `accept`                  | `string` | "Accept"                                  | Text of the accept button                                                                                                                                                                                          |
| `rejectText`          | `reject`                  | `string` | "Reject"                                  | Text of the reject button                                                                                                                                                                                          |
| `maxNrOfAuthAttempts` | `max-nr-of-auth-attempts` | `number` | 3                                         | Maximal number of authentication attempts                                                                                                                                                                          |


#### Slots

| Name | Description                                                  |
| ---- | ------------------------------------------------------------ |
|      | Default content placed inside the main body of the component |

#### Events

| Event      | Type                                | Description                                                                                                                      |
| ---------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `signed`   | `CustomEvent<{ signedPayload: string }>` | Dispatched when the given payload has successfully been signed. The event contains the value of signedPayload from the API response. |
| `failure`  | `CustomEvent<{ reason: string }>`   | Dispatched when signing of the payload has failed. The event contains the reason (decription) of the failure.     |
| `rejected` | `CustomEvent`                       | Dispatched when the reject button is pressed                                                                                     |

#### CSS Shadow Parts

> [!NOTE]
> **Not defined yet…**


| Part          | Description                 |
| ------------- | --------------------------- |
| `placeholder` | Placeholder css shadow part |

#### CSS Custom Properties

> [!NOTE]
> **Not defined yet…**

| Property              | Description                           |
| --------------------- | ------------------------------------- |
| `--placeholder-color` | Controls the color of the placeholder |

### Accept

Clicking on the accept button will call the sign endpoint (see [1.](#1-Keycloak-Sign-Endpoint)) with the given payload and password. On receiving the response, the event handler will dispatch a `CustomEvent` depending on the received HTTP status code (either `signed` when successful or `failed` when there was a failure).


## 3. Keycloak Page

> [!NOTE]
> **Out of scope**

![](https://hedgedoc.inventage.com/uploads/3d34be0a-dd87-4430-a4d8-fe1bc55060be.png)

TODO: describe query parameters, payload, slot, title, accept, reject, authorization

`GET /realms/realm1/signature?payload=...`

This call fetches a page in which the custom element`<keycloak-signature></keycloak-signature>` is embedded. An arbitrary number of query parameters might be added to this call which will be handed over to the custom element. The [attributes section](#attributes) describes which attributes in the custom element are predefined and how they are interpreted.
The response status code is 200.


## Extension Configuration

- Valid domains (for CORS)


## Out of Scope

- `additonal-properties` --> zusätzlicher JSON Parameter der Webkomponente
- Keycloak Page
- Configure Authentication Method
- CORS: client configuration or set response header (Access-Control-Allow-Origin)

## Archive

![Architecture](https://dl.peschee.me/Untitled-2023-09-04-1428-EHqUXP.png)

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
