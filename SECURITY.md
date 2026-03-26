# Security Policy

## Supported Versions

This is a documentation repository. Security-sensitive issues are most likely to involve:

- CI workflow permissions
- dependency and automation configuration
- publishing pipeline integrity

Supported branch:

| Version                | Supported |
| ---------------------- | --------- |
| main                   | Yes       |
| older commits/branches | No        |

## Reporting a Vulnerability

Please do not open public issues for security vulnerabilities.

Preferred reporting path:

1. Use GitHub private vulnerability reporting (Security Advisories) if enabled.
2. If private reporting is unavailable, email lavkushry@gmail.com with:
   - a clear description of the issue
   - impact assessment
   - steps to reproduce
   - suggested mitigation (if available)

## What to Expect

- Initial acknowledgment target: within 7 days
- Ongoing updates: as investigation progresses
- Disclosure: coordinated disclosure after mitigation is available

## Scope Notes

This repository does not ship a production runtime service. Most risk is supply-chain and workflow related.

Out of scope:

- generic Rust language vulnerabilities unrelated to this repository
- issues requiring access to unrelated third-party infrastructure
