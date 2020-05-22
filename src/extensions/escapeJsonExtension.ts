import * as vscode from 'vscode';
import { trackEvent, trackException } from '../utility/trackEvent';

export function escapeJsonExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("escapeJson");
		try {
			var editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No text editor detected!');
				return;
			}
			var selection = editor.selection;
			var text = editor.document.getText(selection);
			var fullRange: vscode.Range;
			var isSelection = false;
			if (text === "") {
				text = editor.document.getText();
				fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(text.length));
			}
			else {
				isSelection = true;
				fullRange = selection;
			}
			if (text === "") {
				vscode.window.showWarningMessage('No text detected!');
				return;
			}
			const edit = new vscode.WorkspaceEdit();
			const newJson = JSON.stringify(text).replace(/\\n/g, "\\n")
				.replace(/\\'/g, "\\'")
				.replace(/\\"/g, '\\"')
				.replace(/\\&/g, "\\&")
				.replace(/\\r/g, "\\r")
				.replace(/\\t/g, "\\t")
				.replace(/\\b/g, "\\b")
				.replace(/\\f/g, "\\f");
			edit.replace(editor.document.uri, fullRange, newJson);
			return  vscode.workspace.applyEdit(edit).then(success => {
				if (success && isSelection) {
					vscode.window.visibleTextEditors[0].selections = vscode.window.visibleTextEditors[0].selections.map(s => {return new vscode.Selection(fullRange.start.with(fullRange.start.line, fullRange.start.character), fullRange.start.with(fullRange.start.line,newJson.length));});
				} 
			});
		}
		catch (error) {
			console.error(error);
			vscode.window.showWarningMessage('Error escaping!');
			trackException("escapeJson", error);
		}
	};
}
