#!/usr/bin/env node

const assetManager = require("../index");

const namingRegex0 = /^[a-zA-Z0-9\_\-\:\?\s]+$/;
let [gameAssetPath, assetsFolderPath, jsonFile] = process.argv.slice(2);

if (!gameAssetPath) {
  throw new Error('You must specify "gameAssetPath" as the first argument');
}

if (!namingRegex0.test(gameAssetPath)) {
  throw new Error(`Argument "gameAssetPath" must match RegEx ${namingRegex0}`);
}

if (!assetsFolderPath) {
  assetsFolderPath = "assets";
}

console.log("Starting module with config:", {
  gameAssetPath,
  assetsFolderPath,
  jsonFile,
});

assetManager(gameAssetPath, assetsFolderPath, jsonFile);
