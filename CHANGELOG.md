# Change Log
## [0.0.8] - 2025-12-15
- Use only $HOME/.topspin1/prop/parfile-dirs.prop PP_DIRS for assosiation 
- Use single and global settings.json 

## [0.0.7] - 2025-12-14
### Added
- `TSHOME` environment variable overrides `spinscript.tshome` configuration setting

### Changed
- Normalize file association paths to forward-slash format across platforms
- Deduplicate paths case-insensitively on Windows, case-sensitively on POSIX systems
- Improved path normalization and deduplication in `parsePulseProgramDirs()`
- Remove one-level-up default from `pulseProgramPaths` configuration

## [0.0.6] - 2025-12-11
- This release introduces a major new feature for automatic file association and includes several stability improvements.

### Changed
- Indexing files in one level higher directories
- Fix to read Windows paths - `C\:/Users/user/OneDrive - Company...` - from prop file
- Parse quoted and escaped paths in `PP_DIRS` (supports entries with spaces and `\:` escaped colons)
- Add `spinscript.tshome` configuration to override `TSHOME` used for path resolution

## [0.0.5] - 2025-12-10

### Added
- Repository and license metadata to package.json

## [0.0.4] - 2025-12-09
- **Automatic File Association**: The extension now automatically detects pulse program directories and applies the `spinscript` language mode.
- It reads pulse program paths from the TopSpin configuration file (`$HOME/.topspin1/prop/parfile-dirs.prop`).
- It uses the new `spinscript.tshome` and `spinscript.pulseProgramPaths` settings for configuration.
- The extension now watches for configuration changes and updates file associations dynamically without requiring a window reload.

### Added
- Parse `$HOME/.topspin1/prop/parfile-dirs.prop` to auto-discover pulse program directories
- Debug logging for search paths in `getSearchPaths()`
- Improved error handling and logging for `parsePulseProgramDirs()`
### Fixed

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

## [0.0.1] - 2024-XX-XX

### Added
- Initial release with Jump-to-definition for subroutine definitions
