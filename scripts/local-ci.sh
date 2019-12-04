#!/bin/bash

set -e

yarn install

proj_dir=example

library_name=$(node -p "require('./package.json').name")
library_version=$(node -p "require('./package.json').version")

isMacOS() {
  [ "$(uname)" == "Darwin" ]
}

###################
# BEFORE INSTALL  #
###################

# Skip iOS step if current os is not macOS
!isMacOS && echo "Current os is not macOS, setup for iOS will be skipped"

# Install react-native-cli if not exist
if ! type react-native > /dev/null; then
  yarn global add react-native-cli
fi

# Remove existing tarball
rm -rf *.tgz

# Create new tarball
yarn pack

cd $proj_dir

###################
# INSTALL         #
###################

# Install dependencies
rm -rf node_modules && yarn install

###################
# BEFORE BUILD    #
###################

# Run appium
(pkill -9 -f appium || true)
yarn run appium > /dev/null 2>&1 &

###################
# BUILD           #
###################

# Run Android emulator
yarn run run-emulator:android
trap 'adb shell reboot -p' 0

# Build Android app
yarn run build:android

# Build iOS app
isMacOS && yarn run build:ios | xcpretty

###################
# TESTS           #
###################

# Run Android e2e tests
yarn run test:android

# Run iOS e2e tests
isMacOS && yarn run test:ios