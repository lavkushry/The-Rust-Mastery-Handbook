#!/bin/bash
lychee --verbose --no-progress --accept 200,206,301,302,307,308,403,429 README.md CONTRIBUTING.md "docs/**/*.md" "src/**/*.md"
