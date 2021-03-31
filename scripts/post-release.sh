#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

git add .
git commit -m "chore: release $PACKAGE_VERSION"
git tag v$PACKAGE_VERSION
git push --tags
git push