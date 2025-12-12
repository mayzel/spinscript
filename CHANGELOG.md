## [0.0.6] - 2025-12-11

### Changed
- Indexing files in one level higher directories
- Fix to read Windows paths - `C\:/Users/user/OneDrive - Company...` - from prop file
- Parse quoted and escaped paths in `PP_DIRS` (supports entries with spaces and `\:` escaped colons)
- Add `spinscript.tshome` configuration to override `TSHOME` used for path resolution

## [0.0.5] - 2025-12-10

### Added
- Repository and license metadata to package.json

## [0.0.4] - 2025-12-09

### Added
- Parse `$HOME/.topspin1/prop/parfile-dirs.prop` to auto-discover pulse program directories
- Debug logging for search paths in `getSearchPaths()`
- Improved error handling and logging for `parsePulseProgramDirs()`

### Changed
- Refactored definition provider search path logic for better maintainability
- Consolidated TSHOME defaults into `getSearchPaths()` method

## [0.0.3] - 2025-12-08

### Added
- Environment variable `$TSHOME` expansion at runtime
- Support for `#define` preprocessor directives in definition provider
- Automatic workspace file association updates (with one-time reload prompt)
- Debug logging for search paths and parsed directories
- Configurable `spinscript.pulseProgramPaths` setting for custom include paths

## [0.0.2] - 2025-12-07
### Added
- Core syntax highlighting for Bruker TopSpin pulse programming language
- Jump-to-definition for `define` / `#define` declarations (pulse, delay, etc.)
- Extended syntax highlighting grammar from JSON schema
- Recursive directory search for include files

## [0.0.1] - 2025-12-06

### Added
- Initial release with Jump-to-definition for subroutine definitions
