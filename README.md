# SpinScript - Support for Bruker TopSpin pulse sequence programming in VS Code

A VS Code extension providing syntax highlighting and "Go to Definition" for the Bruker TopSpin pulse programming language.

## Features

*   **Syntax Highlighting**: Provides syntax highlighting for SpinScript files.
*   **Go to Definition**: Use `F12` or `Ctrl+Click` to jump to the definition of subroutines (`subr`) and variables created with `define`.
*   **Automatic File Association**: The extension automatically identifies your pulse program directories and applies the `spinscript` language mode to all files within them. This feature works by:
    1.  Reading your TopSpin configuration file (`$HOME/.topspin1/prop/parfile-dirs.prop`).
    2.  Scanning directories specified in your VS Code settings.

## How it finds definitions

When you request a definition (Ctrl+Click or F12), the extension searches in this order:
1. Directories parsed from `$HOME/.topspin1/prop/parfile-dirs.prop` (if present)
2. Paths configured in `spinscript.pulseProgramPaths`

It scans `.incl` files for:
- `subroutine name(...)` declarations
- `define type name` declarations
- `#define type name` declarations

## Configuration

The extension uses the following settings, which can be configured in your VS Code `settings.json` file:

*   The extension uses the `$TSHOME` environment variable if it is set.
*   `spinscript.tshome`: The absolute path to your TopSpin installation directory. This is used to resolve relative paths found in `parfile-dirs.prop` if `$TSHOME` is not set
*   `spinscript.pulseProgramPaths`: An array of additional directory paths that contain SpinScript pulse programs. This is useful for project-specific or user-defined program locations. 

#### Example `settings.json`:
```json
{
  "spinscript.tshome": "C:\\Bruker\\TopSpin4.1.3",
  "spinscript.pulseProgramPaths": [
    "${workspaceFolder}/pp",
    "/home/nmr/NMR/pp"
  ]
}
```
On activation, the extension scans the configured directories, generates a set of file association rules (e.g., `"C:/path/to/pp/**": "spinscript"`), and merges them into your global `files.associations` setting. This process runs automatically when you change the `spinscript.tshome` or `spinscript.pulseProgramPaths` settings.

To edit the workspace `settings.json` inside VS Code: open the Command Palette (`Ctrl/Cmd+Shift+P`) and choose `Preferences: Open Workspace Settings (JSON)`, or open the file `.vscode/settings.json` in the explorer.

## Installation
### From VSIX
  Download the .vsix file and install:
  Ctrl-Shift-P > Extensions: Install From VSIX
### From Source (Development)
  Clone or download this repository. git clone https://github.com/mayzel/spinscript.git cd spinscript
  Install dependencies: npm install
  Compile: npm run compile
  Run in the Extension Development Host: press F5 in VS Code.
  Package vsce package


## Known Issues


## Contributing

Bug reports and PRs welcome! Please open an issue on [GitHub](https://github.com/mayzel/spinscript/issues).

## License

MIT — see [LICENSE](LICENSE) file
---

Happy pulse programming!
**Enjoy!**
