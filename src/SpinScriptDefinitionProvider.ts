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
        const spinscriptConfig = vscode.workspace.getConfiguration('spinscript');
        const vsCfgTsHome = spinscriptConfig.get<string>('tshome', '');
        const tsHome = process.env.TSHOME || vsCfgTsHome || '';
        const home = process.env.HOME || process.env.USERPROFILE;

        // // 1. Start with the directory of the currently open file
        // paths.push(path.dirname(document.uri.fsPath));

        // 2. Add paths from TopSpin property file
        paths.push(...parsePulseProgramDirs(tsHome, home));

        // 3. Add paths from VS Code settings
        paths.push(...spinscriptConfig.get<string[]>('pulseProgramPaths', []));

        // Resolve, validate, and deduplicate all collected paths
        const resolvedPaths = resolveAndValidatePaths(paths);
        console.log('SpinScript: resolved search paths for definitions:', resolvedPaths);

        return resolvedPaths;
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

                    // Normalize escaped colon and backslashes common in Windows exports
                    trimmed = trimmed.replace(/\\:/g, ':').replace(/\\\\/g, '\\');

                    // Detect absolute paths:
                    const isUnixAbs = trimmed.startsWith('/');
                    const isWinDrive = /^[A-Za-z]:[\\/]/.test(trimmed);
                    const isUnc = trimmed.startsWith('\\\\') || trimmed.startsWith('\\');

                    if (isUnixAbs || isWinDrive || isUnc) {
                        // absolute as given
                        dirs.push(trimmed);
                    } else {
                        // Relative paths are relative to $TSHOME/exp/stan/nmr
                        if (tsHome) {
                            dirs.push(path.join(tsHome, 'exp', 'stan', 'nmr', trimmed));
                        }
                    }
                }
                break;
            }
        }
        console.log('SpinScript: parsed PP_DIRS from parfile-dirs.prop:', dirs);
        return dirs;
    } catch (err) {
        console.error(`SpinScript: failed to parse ${propFile}`, err);
        // Fallback to default paths on error
        if (tsHome) {
            return [
                path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp'),
                path.join(tsHome, 'exp', 'stan', 'nmr', 'lists', 'pp', 'user')
            ];
        }
        return [];
    }
}

export function resolveAndValidatePaths(rawPaths: string[]): string[] {
    const seen = new Set<string>();
    const validatedPaths: string[] = [];
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';

    for (const p of rawPaths) {
        if (!p) continue;

        // 1. Resolve ${workspaceFolder}
        const resolved = p.replace('${workspaceFolder}', workspaceFolder).trim();
        if (!resolved) continue;

        // 2. Normalize the path
        const normalized = path.normalize(resolved);

        // 3. Check for existence
        if (!fs.existsSync(normalized)) {
            console.log(`SpinScript: directory does not exist, skipping: ${normalized}`);
            continue;
        }

        // 4. Deduplicate (case-insensitively on Windows)
        const key = process.platform === 'win32' ? normalized.toLowerCase() : normalized;
        if (seen.has(key)) continue;

        seen.add(key);
        validatedPaths.push(normalized);
    }

    return validatedPaths;
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
