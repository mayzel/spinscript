import * as vscode from 'vscode';
import { SpinScriptDefinitionProvider } from './SpinScriptDefinitionProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('SpinScript extension activated');

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
