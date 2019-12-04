#!/bin/bash

set -e

###################
# BEFORE CACHE    #
###################
case "${TRAVIS_OS_NAME}" in
  linux)
    rm -rf "$HOME/.gradle/caches/modules-2/modules-2.lock"
  ;;
esac

###################
# BEFORE INSTALL  #
###################
export NODEJS_ORG_MIRROR=http://nodejs.org/dist

wget https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.1/nvm.sh -O ~/.nvm/nvm.sh
source ~/.nvm/nvm.sh

nvm install 11.10.1

nvm use 11.10.1

npm install -g yarn

yarn global add react-native-cli

yarn install

# Remove existing tarball
rm -rf *.tgz

yarn pack

###################
# INSTALL         #
###################
cd example || exit

rm -rf node_modules && yarn install

###################
# BEFORE CI       #
###################
case "${TRAVIS_OS_NAME}" in
  linux)
    echo no | android create avd --force -n test -t android-21 --abi armeabi-v7a --skin WVGA800
    emulator -avd test -scale 96dpi -dpi-device 160 -no-audio -no-window &
    android-wait-for-emulator
    sleep 60
    adb shell input keyevent 82 &
  ;;
esac

yarn run appium > /dev/null 2>&1 &

###################
# CI              #
###################
case "${TRAVIS_OS_NAME}" in
  osx)
    yarn run build:ios | xcpretty -c -f `xcpretty-travis-formatter`
    yarn run test:ios
  ;;
  linux)
    yarn run build:android
    yarn run test:android
  ;;
esac