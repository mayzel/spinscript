# SpinScript

A VS Code extension providing syntax highlighting and lightweight language support for Bruker TopSpin pulse programming sequences.

## Features

- Syntax highlighting for Bruker pulse sequences and include files.
- Jump-to-definition for:
  - subroutine definitions (`subr` / `subroutine`)
  - `define` / `#define` declarations (pulse, delay, etc.)
- Pattern highlighting for pulses, power levels, gradients, phases, shaped pulses, channels, loops, comments and strings.
- Automatic indexing of include/pulse files from configurable paths and from `$TSHOME` when available.
- Optional automatic workspace file-association updates (prompt + reload once).

## Supported file types

- Commonly used: `.pp`, `.incl`.
- Files without an extension are common in pulse-program collections — the extension can associate entire directories (see Configuration).

## Installation

1. Clone or download this repository.
2. Install dependencies: `npm install`
3. Compile: `npm run compile`
4. Run in the Extension Development Host: press **F5** in VS Code.

## Configuration

Settings (in `settings.json` or via the Settings UI):

- spinscript.pulseProgramPaths (array of strings)  
  Directories to search for pulse/include files. Defaults:
  - `${workspaceFolder}`
  - `${workspaceFolder}/..`  
  Note: environment variables like `$TSHOME` are expanded at runtime by the extension; you may add absolute or workspace-relative paths here.

Example `.vscode/settings.json`:
{
  "spinscript.pulseProgramPaths": [
    "${workspaceFolder}/pp",
    "/home/nmr/NMR/pp"
  ],
  "files.associations": {
    "**/exp/stan/nmr/lists/pp/*": "spinscript",
    "/home/nmr/NMR/pp/*": "spinscript"
  }
}

## How it finds definitions
When you request a definition, the extension searches configured directories (current file directory, one level up, spinscript.pulseProgramPaths, and expanded $TSHOME locations) and scans .incl files (and other files in configured folders) for subroutine and define declarations.

## Development

### Build Commands

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile automatically
- `npm run vscode:prepublish` - Prepare for publication

### Testing

Open test pulse sequence files from the `/test` directory to verify syntax highlighting.


## Known Issues

- Nested block comments not yet supported
- Multi-line looping constructs may need refinement

## Release Notes

### 0.0.1

- Initial release with core syntax highlighting support for Bruker TopSpin pulse programming language.

### 0.0.2
- Syntax highlighting following Chris Waudby's vscode-bruker-syntax extension
- Navigation for define pulse myPulse, define delay myDelay, etc.

### 0.0.3
- Navigate for #define declarations
- Automatic include search (current dir + parent), $TSHOME support, configurable paths
- Automatic spinscript extension association for $TSHOME/exp/stan/nmr/lists/pp 


## Contributing

Contributions and feedback are welcome. Please report issues or suggest improvements.

---

**Happy pulse programming!**