# SpinScript

A VS Code extension providing syntax highlighting and language support for Bruker TopSpin pulse programming sequences.

## Features

- **Syntax Highlighting** for Bruker pulse sequence files (`.pp`, `.incl`)
- **Intelligent pattern recognition** for:
  - Pulse commands (`p0`, `p1`, etc.)
  - Power levels (`pl0`, `pl1`, etc.)
  - Gradients (`gp0`, `gp1`, etc.)
  - Phase cycles (`ph0`, `ph1`, etc.)
  - Shaped pulses (`sp0`, `sp1`, etc.)
  - RF channels (`:f1`, `:f2`, `:f3`, `:f4`)
  - Looping constructs (`lo to`, `mc`, `go=`)
  - Comments (line and block)
  - Preprocessor directives

## Supported File Types

- `.pp` - Pulse program files
- `.incl` - Include files
- Files without extension recognized as pulse programs

## Installation

1. Clone or download this repository
2. Install dependencies: `npm install`
3. Compile the extension: `npm run compile`
4. Press **F5** to launch the extension in debug mode

## Development

### Build Commands

- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch for changes and recompile automatically
- `npm run vscode:prepublish` - Prepare for publication

### Testing

Open test pulse sequence files from the `/test` directory to verify syntax highlighting.

## Extension Settings

Currently, SpinScript uses the default Bruker language configuration. Settings can be extended in future versions.

## Known Issues

- Nested block comments not yet supported
- Multi-line looping constructs may need refinement

## Release Notes

### 0.0.1

Initial release with core syntax highlighting support for Bruker TopSpin pulse programming language.

## Contributing

Contributions and feedback are welcome. Please report issues or suggest improvements.

---

**Happy pulse programming!**