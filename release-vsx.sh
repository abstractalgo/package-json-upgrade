#!/usr/bin/env bash

# Add the release token to .env.local as variable OPEN_VSX_RELEASE_TOKEN. Like this:
# OPEN_VSX_RELEASE_TOKEN=my_token

if [ ! -f .env.local ]; then
    echo ".env.local file not found!"
    exit 1
fi

# ugly hax to read .env file
export $(grep -v '^#' .env.local | xargs -d '\n')

DIRTY_VER=$(cat package.json | grep \"version\")
VER=$(node release-vsx-helper.js $DIRTY_VER)

DIRTY_NAME=$(cat package.json | grep \"name\")
NAME=$(node release-vsx-helper.js $DIRTY_NAME)

COMMAND="npx ovsx publish $NAME-$VER.vsix -p $OPEN_VSX_RELEASE_TOKEN"

echo
echo "NAME: $NAME"
echo "VERSION: $VER"
echo "OPEN_VSX_RELEASE_TOKEN: $OPEN_VSX_RELEASE_TOKEN"
echo
echo "This command will be run:"
echo
echo $COMMAND
echo
read -p "Is that okay? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "DOING RELEASE"
  echo
  echo
  echo
  $COMMAND
fi