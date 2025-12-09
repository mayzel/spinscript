"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinScriptDefinitionProvider = void 0;
exports.parsePulseProgramDirs = parsePulseProgramDirs;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
class SpinScriptDefinitionProvider {
    provideDefinition(document, position) {
        const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
        if (!range)
            return null;
        const name = document.getText(range);
        const line = document.lineAt(position.line).text;
        // if (!line.includes("subr")) return null;
        // const workspaceFolders = vscode.workspace.workspaceFolders;
        // if (!workspaceFolders) return null;
        // const defs: vscode.Location[] = [];
        // for (const folder of workspaceFolders) {
        //     const files = getInclFiles(folder.uri.fsPath);
        const defs = [];
        const searchPaths = this.getSearchPaths(document);
        for (const searchPath of searchPaths) {
            if (!fs.existsSync(searchPath))
                continue;
            const files = getInclFiles(searchPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                // Match subroutine definitions
                if (line.includes("subr")) {
                    const reSubr = new RegExp(`subroutine\\s+${name}\\s*\\(`);
                    const matchSubr = reSubr.exec(content);
                    if (matchSubr) {
                        const pos = positionAt(content, matchSubr.index, file);
                        defs.push(pos);
                    }
                }
                // Match define pulse/delay/etc. definitions
                const reDefineVar = new RegExp(`define\\s+\\w+\\s+${name}\\b`);
                const matchDefineVar = reDefineVar.exec(content);
                if (matchDefineVar) {
                    const pos = positionAt(content, matchDefineVar.index, file);
                    defs.push(pos);
                }
                // Match #define BLKGRAD, etc. definitions
                const reDefine = new RegExp(`define\\s+${name}\\b`);
                const matchDefine = reDefine.exec(content);
                if (matchDefine) {
                    const pos = positionAt(content, matchDefine.index, file);
                    defs.push(pos);
                }
            }
        }
        return defs.length ? defs : null;
    }
    getSearchPaths(document) {
        const paths = [];
        const docDir = path.dirname(document.uri.fsPath);
        // 1. Current directory (where the pulse sequence is)
        paths.push(docDir);
        // 2. One level higher
        paths.push(path.dirname(docDir));
        // 3. Parse $HOME/.topspin1/prop/parfile-dirs.prop if available
        const home = process.env.HOME || process.env.USERPROFILE;
        const tsHome = process.env.TSHOME;
        if (tsHome || home) {
            const propDirs = parsePulseProgramDirs(tsHome || '', home);
            paths.push(...propDirs);
        }
        // 4. VS Code workspace settings
        const config = vscode.workspace.getConfiguration('spinscript');
        const customPaths = config.get('pulseProgramPaths', []);
        paths.push(...customPaths);
        console.log('SpinScript: search paths for definitions:', paths);
        return paths;
    }
}
exports.SpinScriptDefinitionProvider = SpinScriptDefinitionProvider;
function parsePulseProgramDirs(tsHome, home) {
    const dirs = [];
    const propFile = path.join(home, '.topspin1', 'prop', 'parfile-dirs.prop');
    if (!fs.existsSync(propFile)) {
        console.log(`SpinScript: ${propFile} not found`);
        return dirs;
    }
    try {
        const content = fs.readFileSync(propFile, 'utf8');
        const lines = content.split('\n');
        for (const line of lines) {
            if (line.startsWith('PP_DIRS=')) {
                const dirSpec = line.replace('PP_DIRS=', '').trim();
                // PP_DIRS can contain semicolon-separated paths
                const pathEntries = dirSpec.split(';');
                for (const entry of pathEntries) {
                    const trimmed = entry.trim();
                    if (!trimmed)
                        continue;
                    // Absolute paths start with /
                    if (trimmed.startsWith('/')) {
                        dirs.push(trimmed);
                    }
                    else {
                        // Relative paths are relative to $TSHOME/exp/stan/nmr
                        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', trimmed));
                    }
                }
                break;
            }
        }
    }
    catch (err) {
        console.error(`SpinScript: failed to parse ${propFile}`, err);
        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp'));
        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp', 'user'));
    }
    console.log('SpinScript: parsed PP_DIRS from parfile-dirs.prop:', dirs);
    return dirs;
}
function getInclFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(f => {
        const filePath = path.join(dir, f);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            results = results.concat(getInclFiles(filePath));
        }
        else if (filePath.endsWith('.incl')) {
            results.push(filePath);
        }
    });
    return results;
}
function positionAt(text, offset, file) {
    const before = text.slice(0, offset);
    const line = before.split(/\r?\n/).length - 1;
    const character = before.length - before.lastIndexOf('\n') - 1;
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(line, character));
}
//# sourceMappingURL=SpinScriptDefinitionProvider.js.map