import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { SpinScriptDefinitionProvider, parsePulseProgramDirs, resolveAndValidatePaths } from './SpinScriptDefinitionProvider';


export function activate(context: vscode.ExtensionContext) {
    console.log('SpinScript extension activated');

    const definitionProvider = new SpinScriptDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { language: "spinscript", scheme: "file" },
            definitionProvider
        ),
        vscode.languages.registerHoverProvider(
            { language: "spinscript", scheme: "file" },
            definitionProvider
        )
    );

    // Setup file associations for discovered pulse program directories
    setupFileAssociations(context);

    // Re-run setup when the configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('spinscript.pulseProgramPaths') || event.affectsConfiguration('spinscript.tshome')) {
                console.log('SpinScript: configuration changed, re-evaluating file associations.');
                setupFileAssociations(context);
            }
        })
    );
}

function getAllPulseProgramPaths(spinscriptConfig: vscode.WorkspaceConfiguration): string[] {
    const paths: string[] = [];

    // 1. Get paths from TopSpin property file
    const vsCfgTsHome = spinscriptConfig.get<string>('tshome', '');
    const tsHome = process.env.TSHOME || vsCfgTsHome || '';
    const home = process.env.HOME || process.env.USERPROFILE;
    if (tsHome || home) {
        paths.push(...parsePulseProgramDirs(tsHome, home)); // Get raw paths from .prop file
    }

    // 2. Get paths from VS Code settings
    const customPaths = spinscriptConfig.get<string[]>('pulseProgramPaths', []);
    paths.push(...customPaths);

    // 3. Use the centralized utility to process all collected paths
    return resolveAndValidatePaths(paths);
}

async function setupFileAssociations(context: vscode.ExtensionContext) {
    const allPaths = getAllPulseProgramPaths(vscode.workspace.getConfiguration('spinscript'));
    const filesConfig = vscode.workspace.getConfiguration('files');

    // Build the associations to be managed by the extension
    const generatedAssociations: {[k:string]:string} = {};
    for (const p of allPaths) {
        let keyBase = p.replace(/\\/g, '/');
        if (keyBase.endsWith('/')) keyBase = keyBase.slice(0, -1);
        // Use globstar to match files in subdirectories as well
        generatedAssociations[`${keyBase}/**`] = 'spinscript';
    }

    console.log('SpinScript: file associations to set:', Object.keys(generatedAssociations));

    // Get the current files.associations from all levels (global, workspace)
    // and merge our new ones in. This preserves all user settings.
    const inspection = filesConfig.inspect<{[k:string]:string}>('associations');
    const globalAssociations = inspection?.globalValue || {};
    const workspaceAssociations = inspection?.workspaceValue || {};

    // The order is important: generated ones can be overridden by more specific user settings.
    const mergedAssociations = { ...generatedAssociations, ...globalAssociations, ...workspaceAssociations };

    const alreadyPrompted = context.globalState.get<boolean>('spinscript.associationsPrompted', false);
    
    try {
        // Update the global files.associations setting directly
        await filesConfig.update('associations', mergedAssociations, vscode.ConfigurationTarget.Global);
        console.log('SpinScript: global file associations updated.');
        
        if (!alreadyPrompted) {
            await context.globalState.update('spinscript.associationsPrompted', true);
            const selection = await vscode.window.showInformationMessage(
                'SpinScript: File associations have been updated.',
                'Reload Window'
            );
            if (selection === 'Reload Window') {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
        }
    } catch (err) {
        console.error('SpinScript: failed to update file associations', err);
        vscode.window.showErrorMessage('SpinScript: Failed to update file associations. See dev console for details.');
    }
}

export function deactivate() {}
