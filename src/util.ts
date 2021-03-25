import { ViewColumn, window, workspace } from "vscode";
import * as copyPaste from "copy-paste";
import _ from "lodash";
import fs from "fs";
const humps = require("humps");
import { typeofJsonc } from "typeof-jsonc";
export function getClipboardText() {
    try {
        return Promise.resolve(copyPaste.paste());
    } catch (error) {
        return Promise.reject(error);
    }
}

export function handleError(error: Error) {
    window.showErrorMessage(error.message);
}

export function generateInterface(json: string): Promise<string> {
    let tryEval = (str: any) => eval(`const a = ${str}; a`);
    let config = workspace.getConfiguration("json2interface");
    try {
        if (config.get("humps")) {
            json = JSON.stringify(humps.camelizeKeys(tryEval(json)));
        }
        return Promise.resolve(
            typeofJsonc(json, config.get("name"), {
                prefix: config.get("prefix"),
                disallowComments: config.get("disallowComments"),
                addExport: config.get("addExport"),
                singleLineJsDocComments: config.get("singleLineJsDocComments")
            })
        );
    } catch (error) {
        return Promise.reject(new Error("JSON 格式 无效"));
    }
}
export function getViewColumn(): ViewColumn {
    const activeEditor = window.activeTextEditor;
    if (!activeEditor) {
        return ViewColumn.One;
    }

    switch (activeEditor.viewColumn) {
        case ViewColumn.One:
            return ViewColumn.Two;
        case ViewColumn.Two:
            return ViewColumn.Three;
    }

    return activeEditor.viewColumn as any;
}

export function pasteToMarker(content: string) {
    const { activeTextEditor } = window;

    return activeTextEditor?.edit(editBuilder => {
        editBuilder.replace(activeTextEditor.selection, content);
    });
}

export function getSelectedText(): Promise<string> {
    const { selection, document } = window.activeTextEditor!;
    return Promise.resolve(document.getText(selection).trim());
}

export function getSelectedFile(): Promise<string> {
    const { document } = window.activeTextEditor!;
    if (_.endsWith(document.fileName, "json")) {
        return Promise.resolve(
            fs.readFileSync(document.fileName, "utf8").toString()
        );
    }
    return Promise.resolve("");
}

export const validateLength = (text: any) => {
    if (text.length === 0) {
        return Promise.reject(new Error("Nothing selected"));
    } else {
        return Promise.resolve(text);
    }
};
