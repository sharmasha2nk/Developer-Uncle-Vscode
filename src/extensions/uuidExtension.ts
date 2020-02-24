import * as vscode from 'vscode';
const uuidv4 = require('uuid/v4');
import { trackEvent } from '../utility/trackEvent';

export function uuidExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("uuid");
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.env.clipboard.writeText(uuidv4()).then(() => vscode.window.showInformationMessage('Copied to your clipboard!'));
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
			vscode.env.clipboard.writeText(uuidv4()).then(() => vscode.window.showInformationMessage('Copied to your clipboard!'));
		}
	};
}
