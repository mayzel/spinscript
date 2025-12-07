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
        // Only activate on 'subr name(...)'
        const line = document.lineAt(position.line).text;
        if (!line.includes("subr"))
            return null;
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders)
            return null;
        const defs = [];
        for (const folder of workspaceFolders) {
            const files = getInclFiles(folder.uri.fsPath);
            for (const file of files) {
                const content = fs.readFileSync(file, 'utf8');
                const re = new RegExp(`subroutine\\s+${name}\\s*\\(`);
                const match = re.exec(content);
                if (match) {
                    const pos = positionAt(content, match.index, file);
                    defs.push(pos);
                }
            }
        }
        return defs.length ? defs : null;
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