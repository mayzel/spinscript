"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinScriptDefinitionProvider = void 0;
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
        // 3. Environment variable $TSHOME
        const tsHome = process.env.TSHOME;
        if (tsHome) {
            paths.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp'));
            paths.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp', 'user'));
            // paths.push(path.join(tsHome, 'inc'));
            // paths.push(path.join(tsHome, 'pulseprogs'));
        }
        // 4. VS Code workspace settings
        const config = vscode.workspace.getConfiguration('spinscript');
        const customPaths = config.get('pulseProgramPaths', []);
        paths.push(...customPaths);
        return paths;
    }
}
exports.SpinScriptDefinitionProvider = SpinScriptDefinitionProvider;
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