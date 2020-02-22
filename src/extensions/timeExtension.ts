import * as vscode from 'vscode';
import { trackEvent } from '../utility/trackEvent';

export function timeExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("time")
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No text editor detected!');
			return; // No open text editor
		}
		if (editor.selection.isEmpty) {
			const selection = editor.selection;
			const edit = new vscode.WorkspaceEdit();
			const uri = editor.document.uri;
			const options: {
				[key: string]: string;
			} = {
				"Local": "Local",
				"UTC": "UTC"
			};
			const quickPick = vscode.window.createQuickPick();
			quickPick.placeholder = "Local or UTC time?";
			quickPick.items = Object.keys(options).map(label => ({ label }));
			quickPick.onDidChangeSelection(selections => {
				quickPick.dispose();
				if (selections[0].label == "UTC") {
					edit.insert(uri, selection.active, new Date().toISOString().
						replace(/T/, ' ').
						replace(/\..+/, ''));
					return vscode.workspace.applyEdit(edit);
				}
				else {
					var t = new Date();
					var z = t.getTimezoneOffset() * 60 * 1000;
					var ttLocal = t.getTime() - z;
					var tLocal = new Date(ttLocal);
					var iso = tLocal.toISOString();
					edit.insert(uri, selection.active, iso.
						replace(/T/, ' '). // replace T with a space
						replace(/\..+/, ''));
					return vscode.workspace.applyEdit(edit);
				}
			});
			quickPick.onDidHide(() => quickPick.dispose());
			quickPick.show();
		}
		else {
			vscode.window.showWarningMessage('Deselect text!');
		}
	};
}
