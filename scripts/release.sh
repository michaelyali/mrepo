#!/usr/bin/env bash

# bump package version
npx bump package.json package-lock.json lib/package.json --ignore-scripts

# generate changelog
npx conventional-changelog -i CHANGELOG.md -s -r 0

# save npm release tag in the package.json
[ ! -z "$NPM_TAG" ] && TAG=$NPM_TAG || TAG="latest"
npx json -I -f ./package.json -e "this.config={...this.config, 'releaseTag': '$TAG'}"