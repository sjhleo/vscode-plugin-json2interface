import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import { Uri, ExtensionContext, commands, window } from "vscode";
import {
    handleError,
    getClipboardText,
    generateInterface,
    pasteToMarker,
    getSelectedText,
    getViewColumn,
    validateLength,
    getSelectedFile
} from "./util";

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        commands.registerCommand(
            "json2Ts.fromSelection",
            transformFromSelection
        )
    );
    context.subscriptions.push(
        commands.registerCommand(
            "json2Ts.fromClipboard",
            transformFromClipboard
        )
    );
    context.subscriptions.push(
        commands.registerCommand("json2Ts.fromFile", transformFromJSONFile)
    );
}

function transformFromSelection() {
    const tmpFilePath = path.join(os.tmpdir(), "type.ts");
    const tmpFileUri = Uri.file(tmpFilePath);

    getSelectedText()
        .then(validateLength)
        .then(generateInterface)
        .then(interfaces => {
            fs.writeFileSync(tmpFilePath, interfaces);
        })
        .then(() => {
            commands.executeCommand("vscode.open", tmpFileUri, getViewColumn());
        })
        .catch(handleError);
}

function transformFromJSONFile() {
    const activeFile = window.activeTextEditor?.document.fileName;
    const filePath = activeFile?.substring(0, activeFile?.lastIndexOf("/"));
    const tmpFilePath = path.join(
        filePath ? filePath : os.tmpdir(),
        "type.ts"
    );
    const tmpFileUri = Uri.file(tmpFilePath);
    getSelectedFile()
        .then(generateInterface)
        .then(interfaces => {
            fs.writeFileSync(tmpFilePath, interfaces);
        })
        .then(() => {
            commands.executeCommand("vscode.open", tmpFileUri, getViewColumn());
        })
        .catch(handleError);
}

function transformFromClipboard() {
    getClipboardText()
        .then(validateLength)
        .then(generateInterface)
        .then(interfaces => {
            pasteToMarker(interfaces);
        })
        .catch(handleError);
}
