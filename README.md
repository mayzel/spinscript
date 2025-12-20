# SpinScript - Support for Bruker TopSpin pulse sequence programming in VS Code

A VS Code extension providing syntax highlighting and "Go to Definition" for the Bruker TopSpin pulse programming language.

## Features

*   **Syntax Highlighting**: Comprehensive highlighting for Bruker pulse programs files.
*   **Go to Definition**: Jump to `subroutine`, `define`, and `#define` declarations across your project and included `.incl` files.
*   **Rich Hover**: Hover over a subroutine name to view its full implementation code in a floating window.
*   **Automatic Configuration**: Automatically detects TopSpin pulse program directories based on `$TSHOME` and `parfile-dirs.prop`.
*   **Custom Paths**: Easily configure additional search paths via settings.

## Configuration

The extension uses the following settings, which can be configured in your VS Code `settings.json` file:

*   The absolute path to your TopSpin installation director shall be defined either via `$TSHOME` environment variable or  `spinscript.tshome`.  
*   The TopSpin installation director is used to resolve relative paths found in `parfile-dirs.prop`


#### Example `settings.json`:
```json
{
  "spinscript.tshome": "C:\\Bruker\\TopSpin5.0.0",
  "spinscript.pulseProgramPaths": [
    "/home/nmr/NMR/pp"
  ]
}
```
On activation, the extension scans the configured directories, generates a set of file association rules (e.g., `"C:/path/to/pp/**": "spinscript"`), and merges them into your global `files.associations` setting. 

To edit the User `settings.json` inside VS Code: open the Command Palette (`Ctrl/Cmd+Shift+P`) and choose `Preferences: Open User Settings`, or open the file `.config/Code/User/settings.json` in the explorer.

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
