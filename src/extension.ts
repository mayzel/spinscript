import * as vscode from 'vscode';
import * as path from 'path';
import { SpinScriptDefinitionProvider } from './SpinScriptDefinitionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('SpinScript extension activated');

    // SpinScript file association
    const filesConfig = vscode.workspace.getConfiguration('files');
    const current = filesConfig.get<{[k:string]:string}>('associations') || {};
    const paths: string[] = [];
    const tsHome = process.env.TSHOME;
    if (tsHome) {
        paths.push(path.join(tsHome,'exp','stan','nmr','lists','pp'));
        paths.push(path.join(tsHome,'exp','stan','nmr','lists','pp','user'));
    }
    const toAdd: {[k:string]:string} = {};
    for (const p of paths) {
        // associate all files in folder (and subfolders)
        toAdd[`${p}/*`] = 'spinscript';
        toAdd[`${p}/**`] = 'spinscript';
    }

    // merge without clobbering existing user entries
    const merged = { ...toAdd, ...current };
    for (const k of Object.keys(toAdd)) {
        if (current[k]) {
            merged[k] = current[k]; // keep user's explicit association if present
        }
    }

    const alreadyPrompted = context.globalState.get<boolean>('spinscript.associationsPrompted', false);

    filesConfig.update('associations', merged, vscode.ConfigurationTarget.Workspace)
        .then(() => {
            console.log('SpinScript: workspace file associations updated.');
            // only offer reload once per VS Code install/workspace (stored in global state)
            if (!alreadyPrompted) {
                // mark that we've prompted so we don't ask again
                context.globalState.update('spinscript.associationsPrompted', true)
                    .then(
                        () => { /* persisted */ },
                        err => console.error('SpinScript: failed to persist prompt state', err)
                    );

                vscode.window.showInformationMessage(
                    'SpinScript: file associations updated for this workspace.',
                    'Reload Window'
                ).then(selection => {
                    if (selection === 'Reload Window') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
        }, (err) => {
            console.error('SpinScript: failed to update file associations', err);
            vscode.window.showErrorMessage('SpinScript: failed to update file associations (see devtools console).');
        });
        
    // Register definition provider for your language
    const provider = vscode.languages.registerDefinitionProvider(
        { language: 'spinscript' },
        new SpinScriptDefinitionProvider()
    );

    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider(
            { language: "spinscript", scheme: "file" },
            new SpinScriptDefinitionProvider()
        )
    );
}

export function deactivate() {}
