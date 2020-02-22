import * as vscode from 'vscode';
const uuidv4 = require('uuid/v4');
import { trackEvent } from '../utility/trackEvent';

export function uuidExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("uuid");
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No text editor detected!');
			return; // No open text editor
		}
		if (editor.selection.isEmpty) {
			// the Position object gives you the line and character where the cursor is
			const selection = editor.selection;
			const edit = new vscode.WorkspaceEdit();
			edit.insert(editor.document.uri, selection.active, uuidv4());
			return vscode.workspace.applyEdit(edit);
		}
		else {
			vscode.window.showWarningMessage('Deselect text!');
		}
	};
}
