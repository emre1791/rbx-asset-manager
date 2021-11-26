# rbx-asset-manager

rbx-asset-manager is a tool that helps develop Roblox based applications by automatically importing assets locally when file changes in the `assets` directory are detected.

# Installation

You can install by using [npm](http://npmjs.org):

```bash
npm install -g rbx-asset-manager
```

And `rbxasset` command will be installed globally to your system path.

# Usage

pass a name for the `rbxasset://[base folder name]`, and rbx-asset-manager will handle the rest:

```bash
rbxasset [base folder name]
```

optionally you can pass name for the assets directory path, like:

```bash
rbxasset [base folder name] [assets folder path]
```

_if not set it will default to `./assets`_

## Result

all the files in `[assets folder path]` will be available in-studio as `rbxasset://[base folder name]/[relative path]`.

file image extensions are automatically removed. supported image extensions: ["png", "jpeg", "jpg", "bmp", "tiff"]
