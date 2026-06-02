# Mantis Web Documentation

Documentation for the **Mantis** vehicle access control admin panel (`siscav-web` repository).

## Index

| Document                                                    | Description                                                           |
| ----------------------------------------------------------- | --------------------------------------------------------------------- |
| [CHANGELOG](./CHANGELOG.md)                                 | Release history                                                       |
| [Architecture Decision Records](./adr/)                     | Numbered ADRs (0001–0009); sequential and permanent — do not renumber |
| [API reference (Portuguese)](./api/mantis-api-reference.md) | Local REST API copy for frontend development                          |

## Onboarding

Setup, scripts, CI, and security scanning are documented in the [root README](../README.md):

- Installation and environment variables
- npm scripts and local CI checks (`lint`, `test`, `build`)
- GitHub Actions CI pipeline
- OWASP ZAP DAST (see [ADR 0007](./adr/0007-dast-owasp-zap-integration.md))

These sections replace the former `GUIA_CI.md` and `GUIA_TESTES_LOCAIS.md` references.
