const {
  readdirSync,
  lstatSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  renameSync,
} = require("fs");
const { join, relative, dirname } = require("path");
const chokidar = require("chokidar");
const jimp = require("jimp");

const supportedImageTypes = ["png", "jpeg", "jpg", "bmp", "tiff"];
const versionsBasePath = join(process.env.LOCALAPPDATA, "Roblox", "Versions");
const allVersionPaths = readdirSync(versionsBasePath)
  .filter((dir) => dir.startsWith("version-"))
  .map((dir) => join(versionsBasePath, dir))
  .filter((path) => lstatSync(path).isDirectory())
  .map((path) => join(path, "content"));

const onEvent = async (folderName, assetsPath, versionPath, event, path) => {
  const relativePath = relative(assetsPath, path);
  const targetPath = join(versionPath, folderName, relativePath);
  const targetDir = dirname(targetPath);
  const targetExists = existsSync(targetDir);

  const [_, versionNumber] = versionPath.match(/version-(\w+)[\\\/]/);
  const targetPathExtless = targetPath.split(".").slice(0, -1).join(".");

  switch (event) {
    case "add":
      if (!targetExists) mkdirSync(targetDir, { recursive: true });

      if (supportedImageTypes.find((ext) => targetPath.endsWith(`.${ext}`))) {
        if (targetPath.endsWith("png")) {
          copyFileSync(path, targetPathExtless);
        } else {
          const imageTempPath = `${targetPathExtless}.png`;
          const image = await jimp.read(path);
          await image.writeAsync(imageTempPath);
          renameSync(imageTempPath, targetPathExtless);
        }
      } else {
        copyFileSync(path, targetPath);
      }

      console.log("added", relativePath, "to version", versionNumber);
      break;

    case "unlink":
      if (targetExists) unlinkSync(targetPath);
      if (existsSync(targetPathExtless)) unlinkSync(targetPathExtless);
      console.log("removed", relativePath, "from version", versionNumber);
      break;
  }
};

module.exports = (folderName, assetsPath) => {
  chokidar.watch(assetsPath).on("all", (event, path) => {
    allVersionPaths.forEach((versionPath) => {
      onEvent(folderName, assetsPath, versionPath, event, path);
    });
  });
};
