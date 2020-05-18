import * as vscode from 'vscode';
import { trackEvent, trackException } from '../utility/trackEvent';

export function formatJsonExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("formatJson");
		try {
			var editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No text editor detected!');
				return;
			}
			var selection = editor.selection;
			var text = editor.document.getText(selection);
			var fullRange;
			if (text === "") {
				text = editor.document.getText();
				fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length - 1));
			}
			else {
				fullRange = selection;
			}
			if (text === "") {
				vscode.window.showWarningMessage('No text detected!');
				return;
			}
			const edit = new vscode.WorkspaceEdit();
			edit.replace(editor.document.uri, fullRange, JSON.stringify(JSON.parse(text), null, 2));
			return vscode.workspace.applyEdit(edit);
		}
		catch (error) {
			vscode.window.showWarningMessage('Error formatting JSON!');
			trackException("formatJson", error);
		}
	};
}
