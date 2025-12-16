"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const SpinScriptDefinitionProvider_1 = require("./SpinScriptDefinitionProvider");
function activate(context) {
    console.log('SpinScript extension activated');
    context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: "spinscript", scheme: "file" }, new SpinScriptDefinitionProvider_1.SpinScriptDefinitionProvider()));
    // Setup file associations for discovered pulse program directories
    setupFileAssociations(context);
    // Re-run setup when the configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('spinscript.pulseProgramPaths') || event.affectsConfiguration('spinscript.tshome')) {
            console.log('SpinScript: configuration changed, re-evaluating file associations.');
            setupFileAssociations(context);
        }
    }));
}
function getAllPulseProgramPaths(spinscriptConfig) {
    const paths = [];
    // 1. Get paths from TopSpin property file
    const vsCfgTsHome = spinscriptConfig.get('tshome', '');
    const tsHome = process.env.TSHOME || vsCfgTsHome || '';
    const home = process.env.HOME || process.env.USERPROFILE;
    if (tsHome || home) {
        paths.push(...(0, SpinScriptDefinitionProvider_1.parsePulseProgramDirs)(tsHome, home)); // Get raw paths from .prop file
    }
    // 2. Get paths from VS Code settings
    const customPaths = spinscriptConfig.get('pulseProgramPaths', []);
    paths.push(...customPaths);
    // 3. Use the centralized utility to process all collected paths
    return (0, SpinScriptDefinitionProvider_1.resolveAndValidatePaths)(paths);
}
async function setupFileAssociations(context) {
    const allPaths = getAllPulseProgramPaths(vscode.workspace.getConfiguration('spinscript'));
    const filesConfig = vscode.workspace.getConfiguration('files');
    // Build the associations to be managed by the extension
    const generatedAssociations = {};
    for (const p of allPaths) {
        let keyBase = p.replace(/\\/g, '/');
        if (keyBase.endsWith('/'))
            keyBase = keyBase.slice(0, -1);
        // Use globstar to match files in subdirectories as well
        generatedAssociations[`${keyBase}/**`] = 'spinscript';
    }
    console.log('SpinScript: file associations to set:', Object.keys(generatedAssociations));
    // Get the current files.associations from all levels (global, workspace)
    // and merge our new ones in. This preserves all user settings.
    const inspection = filesConfig.inspect('associations');
    const globalAssociations = inspection?.globalValue || {};
    const workspaceAssociations = inspection?.workspaceValue || {};
    // The order is important: generated ones can be overridden by more specific user settings.
    const mergedAssociations = { ...generatedAssociations, ...globalAssociations, ...workspaceAssociations };
    const alreadyPrompted = context.globalState.get('spinscript.associationsPrompted', false);
    try {
        // Update the global files.associations setting directly
        await filesConfig.update('associations', mergedAssociations, vscode.ConfigurationTarget.Global);
        console.log('SpinScript: global file associations updated.');
        if (!alreadyPrompted) {
            await context.globalState.update('spinscript.associationsPrompted', true);
            const selection = await vscode.window.showInformationMessage('SpinScript: File associations have been updated.', 'Reload Window');
            if (selection === 'Reload Window') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        }
    }
    catch (err) {
        console.error('SpinScript: failed to update file associations', err);
        vscode.window.showErrorMessage('SpinScript: Failed to update file associations. See dev console for details.');
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map