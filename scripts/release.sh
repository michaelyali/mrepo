#!/usr/bin/env bash

# bump package version
npx bump package.json package-lock.json lib/package.json --ignore-scripts

# generate changelog
npx conventional-changelog -i CHANGELOG.md -s -r 0
