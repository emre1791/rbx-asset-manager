const {
  readdirSync,
  lstatSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  renameSync,
  readFileSync,
  writeFileSync,
} = require("fs");
const { join, relative, dirname } = require("path");
const chokidar = require("chokidar");
const jimp = require("jimp");
const md5 = require("md5");

const supportedImageTypes = ["png", "jpeg", "jpg", "bmp", "tiff"];
const versionsBasePath = join(process.env.LOCALAPPDATA, "Roblox", "Versions");
const allVersionPaths = readdirSync(versionsBasePath)
  .filter((dir) => dir.startsWith("version-"))
  .map((dir) => join(versionsBasePath, dir))
  .filter((path) => lstatSync(path).isDirectory())
  .map((path) => join(path, "content"));

const mapJson = {};

const onEvent = async (
  folderName,
  assetsPath,
  jsonFile,
  versionPath,
  event,
  path
) => {
  const relativePath = relative(assetsPath, path);
  const targetPath = join(versionPath, folderName, relativePath);
  const targetDir = dirname(targetPath);

  const [_, versionNumber] = versionPath.match(/version-(\w+)[\\\/]/);
  const targetPathExtless = targetPath.split(".").slice(0, -1).join(".");

  switch (event) {
    case "add":
      const contentHash = md5(readFileSync(path, "utf8"));
      let writtenPath;

      if (!existsSync(targetDir)) mkdirSync(targetDir, { recursive: true });

      if (supportedImageTypes.find((ext) => targetPath.endsWith(`.${ext}`))) {
        if (targetPath.endsWith("png")) {
          copyFileSync(path, targetPathExtless);
        } else {
          const imageTempPath = `${targetPathExtless}.png`;
          const image = await jimp.read(path);
          await image.writeAsync(imageTempPath);
          renameSync(imageTempPath, targetPathExtless);
        }

        writtenPath = targetPathExtless;
      } else {
        copyFileSync(path, targetPath);
        writtenPath = targetPath;
      }

      // Hashed Copy
      if (jsonFile) {
        copyFileSync(
          writtenPath,
          join(versionPath, folderName, `content-${contentHash}`)
        );
        mapJson[
          relativePath.split(".").slice(0, -1).join(".").replace(/\\/g, "/")
        ] = `rbxasset://${folderName}/content-${contentHash}`;

        writeFileSync(jsonFile, JSON.stringify(mapJson));
      }

      console.log("added", relativePath, "to version", versionNumber);
      break;

    case "unlink":
      if (existsSync(targetPath)) unlinkSync(targetPath);
      if (existsSync(targetPathExtless)) unlinkSync(targetPathExtless);
      console.log("removed", relativePath, "from version", versionNumber);
      break;
  }
};

module.exports = (folderName, assetsPath, jsonFile) => {
  chokidar.watch(assetsPath).on("all", (event, path) => {
    allVersionPaths.forEach((versionPath) => {
      onEvent(folderName, assetsPath, jsonFile, versionPath, event, path);
    });
  });
};
