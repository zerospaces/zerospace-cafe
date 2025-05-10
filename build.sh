#!/bin/bash

if [ -d "./src/diary" ]; then
  rm -rf "./src/diary"
fi

git clone https://github.com/zerospaces/cafe-diaries.git ./src/diary --depth 1
rm -rf "./src/diary/.git"
pnpm docs:build