import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class SpinScriptDefinitionProvider implements vscode.DefinitionProvider {

    provideDefinition(document: vscode.TextDocument, position: vscode.Position) {

        const range = document.getWordRangeAtPosition(position, /[A-Za-z_]\w*/);
        if (!range) return null;

        const name = document.getText(range);
        const line = document.lineAt(position.line).text;

        const defs: vscode.Location[] = [];
        const searchPaths = this.getSearchPaths(document);        
        for (const searchPath of searchPaths) {
            if (!fs.existsSync(searchPath)) continue;
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

    private getSearchPaths(document: vscode.TextDocument): string[] {
        const paths: string[] = [];
        const docDir = path.dirname(document.uri.fsPath);

        // 1. Current directory (where the pulse sequence is)
        paths.push(docDir);

        // 2. One level higher
        // paths.push(path.dirname(docDir));

        // 3. Parse $HOME/.topspin1/prop/parfile-dirs.prop if available
        const home = process.env.HOME || process.env.USERPROFILE;
        const tsHome = process.env.TSHOME;
        if (tsHome || home) {
            const propDirs = parsePulseProgramDirs(tsHome || '', home);
            paths.push(...propDirs);
        }

        // 4. VS Code workspace settings
        const config = vscode.workspace.getConfiguration('spinscript');
        const customPaths = config.get<string[]>('pulseProgramPaths', []);
        paths.push(...customPaths);

        console.log('SpinScript: search paths for definitions:', paths);

        return paths;
    }

}

export function parsePulseProgramDirs(tsHome: string, home: string): string[] {
    const dirs: string[] = [];
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
                    let trimmed = entry.trim();
                    if (!trimmed) continue;

                    // Strip surrounding quotes ("..." or '...')
                    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
                        (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                        trimmed = trimmed.slice(1, -1).trim();
                        if (!trimmed) continue;
                    }

                    // Normalize common escaping coming from Windows-style specs
                    // e.g. "C\:/Users/..." -> "C:/Users/..." and convert backslashes
                    trimmed = trimmed.replace(/\\:/g, ':').replace(/\\\\/g, '\\').replace(/\\/g, path.sep);

                    // Detect absolute paths:
                    // - Unix absolute: starts with '/'
                    // - Windows drive-letter absolute: 'C:/' or 'C:\'
                    // - UNC paths: starts with '\\'
                    const isUnixAbs = trimmed.startsWith('/');
                    const isWinDrive = /^[A-Za-z]:[\\/]/.test(trimmed);
                    const isUnc = trimmed.startsWith('\\\\');

                    if (isUnixAbs || isWinDrive || isUnc) {
                        dirs.push(trimmed);
                    } else {
                        // Relative paths are relative to $TSHOME/exp/stan/nmr
                        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', trimmed));
                    }
                }
                break;
            }
        }
    } catch (err) {
        console.error(`SpinScript: failed to parse ${propFile}`, err);
        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp'));
        dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp', 'user'));
    }

    console.log('SpinScript: parsed PP_DIRS from parfile-dirs.prop:', dirs);
    return dirs;
}

function getInclFiles(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach(f => {
        const filePath = path.join(dir, f);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            results = results.concat(getInclFiles(filePath));
        } else if (filePath.endsWith('.incl')) {
            results.push(filePath);
        }
    });

    return results;
}

function positionAt(text: string, offset: number, file: string): vscode.Location {
    const before = text.slice(0, offset);
    const line = before.split(/\r?\n/).length - 1;
    const character = before.length - before.lastIndexOf('\n') - 1;
    return new vscode.Location(vscode.Uri.file(file), new vscode.Position(line, character));
}
