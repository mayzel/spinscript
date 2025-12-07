"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const SpinScriptDefinitionProvider_1 = require("./SpinScriptDefinitionProvider");
function activate(context) {
    console.log('SpinScript extension activated');
    // Register definition provider for your language
    const provider = vscode.languages.registerDefinitionProvider({ language: 'spinscript' }, new SpinScriptDefinitionProvider_1.SpinScriptDefinitionProvider());
    context.subscriptions.push(vscode.languages.registerDefinitionProvider({ language: "spinscript", scheme: "file" }, new SpinScriptDefinitionProvider_1.SpinScriptDefinitionProvider()));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map