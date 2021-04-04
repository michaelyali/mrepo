#!/usr/bin/env bash

PACKAGE_VERSION=$(cat package.json | npx jase version)

git add .
git commit -m "chore: release $PACKAGE_VERSION"
git push