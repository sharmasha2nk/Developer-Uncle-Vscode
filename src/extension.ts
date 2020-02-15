import * as vscode from 'vscode';
const uuidv4 = require('uuid/v4');

export function activate(context: vscode.ExtensionContext) {

	let unescapeJson = vscode.commands.registerCommand('extension.unescapeJson', () => {
		try {
			var editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No text editor detected!');
				return;
			}

			var selection = editor.selection;
			var text = editor.document.getText(selection);

			var fullRange;
			if (text == "") {
				text = editor.document.getText();
				fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(text.length - 1)
				)
			} else {
				fullRange = selection;
			}

			if (text == "") {
				vscode.window.showWarningMessage('No text detected!');
				return;
			}

			const edit = new vscode.WorkspaceEdit();
			edit.replace(editor.document.uri, fullRange, JSON.parse(text));

			return vscode.workspace.applyEdit(edit);
		} catch (error) {
			vscode.window.showWarningMessage('Error un-escaping!');
		}
	});

	let escapeJson = vscode.commands.registerCommand('extension.escapeJson', () => {
		try {
			var editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No text editor detected!');
				return;
			}

			var selection = editor.selection;
			var text = editor.document.getText(selection);

			var fullRange;
			if (text == "") {
				text = editor.document.getText();
				fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(text.length - 1)
				)
			} else {
				fullRange = selection;
			}

			if (text == "") {
				vscode.window.showWarningMessage('No text detected!');
				return;
			}

			const edit = new vscode.WorkspaceEdit();
			edit.replace(editor.document.uri, fullRange, JSON.stringify(text).replace(/\\n/g, "\\n")
				.replace(/\\'/g, "\\'")
				.replace(/\\"/g, '\\"')
				.replace(/\\&/g, "\\&")
				.replace(/\\r/g, "\\r")
				.replace(/\\t/g, "\\t")
				.replace(/\\b/g, "\\b")
				.replace(/\\f/g, "\\f"));

			return vscode.workspace.applyEdit(edit);
		} catch (error) {
			vscode.window.showWarningMessage('Error escaping!');
		}
	});

	let formatJson = vscode.commands.registerCommand('extension.formatJson', () => {
		try {
			var editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showWarningMessage('No text editor detected!');
				return;
			}

			var selection = editor.selection;
			var text = editor.document.getText(selection);

			var fullRange;
			if (text == "") {
				text = editor.document.getText();
				fullRange = new vscode.Range(
					editor.document.positionAt(0),
					editor.document.positionAt(text.length - 1)
				)
			} else {
				fullRange = selection;
			}

			if (text == "") {
				vscode.window.showWarningMessage('No text detected!');
				return;
			}

			const edit = new vscode.WorkspaceEdit();
			edit.replace(editor.document.uri, fullRange, JSON.stringify(JSON.parse(text), null, 2));

			return vscode.workspace.applyEdit(edit);
		} catch (error) {
			vscode.window.showWarningMessage('Error formating JSON!');
		}
	});

	let time = vscode.commands.registerCommand('extension.time', () => {
		var editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showWarningMessage('No text editor detected!');
			return; // No open text editor
		}

		if (editor.selection.isEmpty) {
			const selection = editor.selection;
			const edit = new vscode.WorkspaceEdit();
			const uri = editor.document.uri;
			const options: { [key: string]: string } = {
				"UTC": "UTC",
				"Local": "Local"
			};
			const quickPick = vscode.window.createQuickPick();
			quickPick.items = Object.keys(options).map(label => ({ label }));
			quickPick.onDidChangeSelection(selections => {
				quickPick.dispose();
				if (selections[0].label == "UTC") {
					edit.insert(uri, selection.active, new Date().toISOString().
						replace(/T/, ' ').
						replace(/\..+/, ''));
					return vscode.workspace.applyEdit(edit);
				} else {
					var t = new Date();
					var z = t.getTimezoneOffset() * 60 * 1000;
					var ttLocal = t.getTime() - z;
					var tLocal = new Date(ttLocal);
					var iso = tLocal.toISOString();
					edit.insert(uri, selection.active, iso.
						replace(/T/, ' ').      // replace T with a space
						replace(/\..+/, ''));
					return vscode.workspace.applyEdit(edit);
				}
			});
			quickPick.onDidHide(() => quickPick.dispose());
			quickPick.show();
		} else {
			vscode.window.showWarningMessage('Deselect text!');
		}

	});

	let uuid4 = vscode.commands.registerCommand('extension.uuid4', () => {
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
		} else {
			vscode.window.showWarningMessage('Deselect text! 😱');
		}

	});

	let surprise = vscode.commands.registerCommand('extension.surprise', () => {
		var items = Array('You are awesome! 😃', 'You are great!',
			'Go confidently in the direction of your dreams and live the life you have imagined.',
			'Always remember you are braver than you believe, stronger than you seem, and smarter than you think.',
			'If you\'re presenting yourself with confidence, you can pull off pretty much anything.',
			'You’re off to great places, today is your day. Your mountain is waiting, so get on your way.',
			'It always seems impossible until it is done.',
			'Keep your face to the sunshine and you cannot see a shadow.',
			'Once you replace negative thoughts with positive ones, you’ll start having positive results.',
			'In every day, there are 1,440 minutes. That means we have 1,440 daily opportunities to make a positive impact.',
			'The only time you fail is when you fall down and stay down.');
		vscode.window.showInformationMessage(items[Math.floor(Math.random() * items.length)]);
	});

	context.subscriptions.push(surprise);
	context.subscriptions.push(unescapeJson);
	context.subscriptions.push(escapeJson);
	context.subscriptions.push(formatJson);
	context.subscriptions.push(time);
	context.subscriptions.push(uuid4);
}

export function deactivate() { }
