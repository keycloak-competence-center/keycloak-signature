Keycloak Signature Extension
===============

![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/keycloak-competence-center/keycloak-signature?sort=semver)
![Keycloak Dependency Version](https://img.shields.io/badge/Keycloak-22.0.1-blue)
![GitHub Release Date](https://img.shields.io/github/release-date-pre/keycloak-competence-center/keycloak-signature)
![Github Last Commit](https://img.shields.io/github/last-commit/keycloak-competence-center/keycloak-signature)

![CI build](https://github.com/keycloak-competence-center/keycloak-signature/actions/workflows/build-pipeline.yml/badge.svg)
![open issues](https://img.shields.io/github/issues/keycloak-competence-center/keycloak-signature)

## What is it good for?

The Keycloak Signature Extension gives Keycloak the ability to sign any values, after the user has "re-authenticated" himself. If the credentials are valid, Keycloak will response with a signed JWT including the payload.

## Implementation Variants

This extension can be used in 3 different ways:

- **[Keycloak Sign Endpoint](./SPECIFICATION.md#1-Keycloak-Sign-Endpoint)**: The minimal way is sending the necessary data to the sign endpoint.
- **[Custom Element](./SPECIFICATION.md#2-Custom-Element)**: Using the `<keycloak-signature>` web component which calls the POST [Keycloak Sign Endpoint](./SPECIFICATION.md#1-Keycloak-Sign-Endpoint).
- **[Keycloak Page](./SPECIFICATION.md#3-Keycloak-Page)**: Integrates the `<keycloak-signature>` [custom element](./SPECIFICATION.md#2-Custom-Element) to provide signing functionality.

Have a look at the [specification](./SPECIFICATION.md) for more detailed information about composition and configuration.

## Installation

This extension can be downloaded as a Java Archive (jar) and can simply be placed in the
providers directory of your Keycloak.

## Development

This project creates a custom [Keycloak] server based on [Keycloak.X]. It is structured as a multi-module Maven build and contains the following top-level modules:

- `config`: provides the build stage configuration and the setup of Keycloak
- `container`: creates the custom docker image
- `docker-compose`: provides a sample for launching the custom docker image
- `extensions`: provides the implementation of the signature extension
- `server`: provides a Keycloak installation for local development & testing

Please refer to the [tutorial of custom Keycloak](https://keycloak.ch/keycloak-tutorials/tutorial-custom-keycloak/) for more details of this project.

### Requirements

Please have a look at the [requirements of custom Keycloak](https://keycloak.ch/keycloak-tutorials/tutorial-custom-keycloak/#requirements).

For this project, you also need:

- [Node.js] (18.15.0)

### Getting Started

- Please have a look at [how you can run custom Keycloak](https://keycloak.ch/keycloak-tutorials/tutorial-custom-keycloak/#usage).
- In order to develop on the `<keycloak-signature>` component you can use the web dev server. Run the following command under `./extensions/extension-signature/src/main/web`:

    ```shell
    npm start
    ```
     
## Sponsors

Development of the initial version was sponsored by [Körber Pharma](https://www.koerber-pharma.com/)

## Support

For more support for this extension or your Keycloak project in general, visit [Keycloak Competence Center Switzerland](https://keycloak.ch)

[Keycloak]: https://keycloak.org
[Keycloak.X]: https://www.keycloak.org/migration/migrating-to-quarkus
[Node.js]: https://nodejs.org/
