# SpinScript

A VS Code extension providing syntax highlighting and lightweight language support for Bruker TopSpin pulse programming sequences.

## Features

- **Syntax highlighting** for Bruker pulse sequences and include files.
- **Jump-to-definition** for:
  - subroutine definitions (`subr` / `subroutine`)
  - `define` / `#define` declarations (pulse, delay, channels, etc.)
- **Pattern highlighting** for pulses, power levels, gradients, phases, shaped pulses, channels, loops, comments and strings.
- **Auto-discovery** of pulse program directories from:
  - `$HOME/.topspin1/prop/parfile-dirs.prop` (if available)
  - `$TSHOME/exp/stan/nmr/lists/pp` (if `TSHOME` env var set)
  - Current file directory and one level up
  - Configurable paths via `spinscript.pulseProgramPaths` setting
- **Automatic workspace file-association** updates (prompt + reload once).

## Supported file types

- Commonly used: `.pp`, `.incl`.
- Files without an extension are common in pulse-program collections — the extension can associate entire directories (see Configuration).

## Installation

### From VSIX
1. Download the `.vsix` file and install:
2. Ctrl-Shift-P > Extensions: Install From VSIX

### From Source (Development)
1. Clone or download this repository.
   git clone https://github.com/mayzel/spinscript.git
   cd spinscript
2. Install dependencies: `npm install`
3. Compile: `npm run compile`
4. Run in the Extension Development Host: press **F5** in VS Code.


## Configuration

Settings (in `settings.json` or via the Settings UI):

- **spinscript.pulseProgramPaths** (array of strings)  
  Additional directories to search for pulse/include files. Defaults: `${workspaceFolder}`
  Note: environment variables like `$TSHOME` are expanded at runtime by the extension.

- **spinscript.tshome** (string)  
  Optional override for the TopSpin installation root (`TSHOME`). When set, the extension uses this value instead of the `TSHOME` environment variable when resolving relative pulse program paths and parsing `parfile-dirs.prop`.

Example `.vscode/settings.json`:

```json
{
  "spinscript.pulseProgramPaths": [
    "${workspaceFolder}/pp",
    "/home/nmr/NMR/pp"
  ],
  "spinscript.tshome": "/path/to/TopSpin"
}
```

To edit the workspace `settings.json` inside VS Code: open the Command Palette (`Ctrl/Cmd+Shift+P`) and choose `Preferences: Open Workspace Settings (JSON)`, or open the file `.vscode/settings.json` in the explorer.

### Auto-discovery via parfile-dirs.prop

If `$HOME/.topspin1/prop/parfile-dirs.prop` exists, the extension automatically parses the `PP_DIRS` setting and adds those directories to the search path. This is useful when working with Bruker TopSpin installations that define custom pulse program locations.

Notes about parsing:
- The parser accepts semicolon-separated entries and supports quoted paths (single or double quotes) which is useful when a directory name contains spaces.
- Windows-style entries such as `C\:/Users/...` or `C:/Users/...`, and UNC paths are recognized and treated as absolute.
- Escaped characters like `\:` are normalized to `:` so `C\:/...` is parsed as `C:/...`.

### File associations

Optionally, add workspace `files.associations` to treat all files in specific directories as SpinScript:

```json
{
  "files.associations": {
    "**/exp/stan/nmr/lists/pp/*": "spinscript",
    "/Users/may/pp/*": "spinscript"
  }
}
```

## How it finds definitions

When you request a definition (Ctrl+Click or F12), the extension searches in this order:
1. Current file directory
2. One level up from current file
3. Directories parsed from `$HOME/.topspin1/prop/parfile-dirs.prop` (if present)
4. `$TSHOME/exp/stan/nmr/lists/pp` and `$TSHOME/exp/stan/nmr/lists/pp/user` (if `TSHOME` set)
5. Paths configured in `spinscript.pulseProgramPaths`

It scans `.incl` files for:
- `subroutine name(...)` declarations
- `define type name` declarations
- `#define type name` declarations

## Development

- `npm run compile` — build
- `npm run watch` — watch + rebuild
- `npm run vscode:prepublish` — prepare for distribution

## Packaging

To create a `.vsix` package for distribution:

```bash
npm install -g vsce
npm run compile
vsce package
```
This generates `spinscript-0.0.5.vsix`.

## Release Notes
### 0.0.6
- Bugfixes

### 0.0.5
- License and metadata added 

### 0.0.4
- Auto-discover pulse program directories from `parfile-dirs.prop`

### 0.0.3
- Support for `#define` preprocessor directives
- Automatic workspace file associations with one-time reload prompt
- Debug logging for troubleshooting path resolution

### 0.0.2
- Extended definition provider and syntax highlighting
- Support for `define` declarations across multiple types

### 0.0.1
- Initial release with core syntax highlighting and subroutine jump-to-definition

## Contributing

Bug reports and PRs welcome! Please open an issue on [GitHub](https://github.com/mayzel/spinscript/issues).

## License

MIT — see [LICENSE](LICENSE) file
---

Happy pulse programming!
