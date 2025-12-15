"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const SpinScriptDefinitionProvider_1 = require("./SpinScriptDefinitionProvider");
function activate(context) {
    console.log('SpinScript extension activated');
    context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: "spinscript", scheme: "file" }, new SpinScriptDefinitionProvider_1.SpinScriptDefinitionProvider()));
    // Setup file associations for discovered pulse program directories
    setupFileAssociations(context);
}
function setupFileAssociations(context) {
    const filesConfig = vscode.workspace.getConfiguration('files');
    const current = filesConfig.get('associations') || {};
    const paths = [];
    const spinscriptConfig = vscode.workspace.getConfiguration('spinscript');
    const vsCfgTsHome = spinscriptConfig.get('tshome', '');
    const tsHome = process.env.TSHOME || vsCfgTsHome || '';
    const home = process.env.HOME || process.env.USERPROFILE;
    if (tsHome || home) {
        const propDirs = (0, SpinScriptDefinitionProvider_1.parsePulseProgramDirs)(tsHome, home);
        paths.push(...propDirs);
    }
    // Get configured paths
    const customPaths = spinscriptConfig.get('pulseProgramPaths', []);
    // Resolve ${workspaceFolder} variable in custom paths
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
    const resolvedCustomPaths = customPaths.map(p => {
        return p.replace('${workspaceFolder}', workspaceFolder);
    });
    paths.push(...resolvedCustomPaths);
    // Build file associations
    const toAdd = {};
    const seenBases = new Set();
    for (const p of paths) {
        const norm = path.normalize(p);
        if (!fs.existsSync(norm)) {
            console.log(`SpinScript: directory does not exist: ${p}`);
            continue;
        }
        // Normalize to forward-slash form for VS Code globs and dedupe case-insensitively on Windows
        let keyBase = norm.replace(/\\/g, '/');
        if (keyBase.endsWith('/'))
            keyBase = keyBase.slice(0, -1);
        const dedupeKey = process.platform === 'win32' ? keyBase.toLowerCase() : keyBase;
        if (seenBases.has(dedupeKey))
            continue; // already added equivalent path
        seenBases.add(dedupeKey);
        // associate all files in folder (and subfolders)
        toAdd[`${keyBase}/*`] = 'spinscript';
    }
    console.log('SpinScript: file associations to add:', Object.keys(toAdd));
    // Merge without clobbering existing user entries
    const merged = { ...toAdd, ...current };
    for (const k of Object.keys(toAdd)) {
        if (current[k]) {
            merged[k] = current[k]; // keep user's explicit association if present
        }
    }
    const alreadyPrompted = context.globalState.get('spinscript.associationsPrompted', false);
    filesConfig.update('associations', merged, vscode.ConfigurationTarget.Workspace)
        .then(() => {
        console.log('SpinScript: workspace file associations updated.');
        if (!alreadyPrompted) {
            context.globalState.update('spinscript.associationsPrompted', true)
                .then(() => { }, err => console.error('SpinScript: failed to persist prompt state', err));
            vscode.window.showInformationMessage('SpinScript: file associations updated for this workspace.', 'Reload Window').then(selection => {
                if (selection === 'Reload Window') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
    }, (err) => {
        console.error('SpinScript: failed to update file associations', err);
        vscode.window.showErrorMessage('SpinScript: failed to update file associations (see devtools console).');
    });
}
function deactivate() { }
//# sourceMappingURL=extension.js.map