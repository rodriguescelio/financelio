#!/bin/bash

find client/* -not -name '.gitkeep' -delete

cd ../client

yarn build

cp -r dist/* ../server/client
