import * as vscode from 'vscode';
import { timeExtension } from './extensions/timeExtension';
import { uuidExtension } from './extensions/uuidExtension';
import { surpriseExtension } from './extensions/surpriseExtension';
import { formatJsonExtension } from './extensions/formatJsonExtension';
import { escapeJsonExtension } from './extensions/escapeJsonExtension';
import { unescapeJsonExtension } from './extensions/unescapeJsonExtension';
import { init, queryExtension } from './extensions/queryExtension';
import { iftttExtension, iftttEventsExtension } from './extensions/iftttExtension';

export function activate(context: vscode.ExtensionContext) {

	let unescapeJson = vscode.commands.registerCommand('extension.unescapeJson', unescapeJsonExtension());
	let escapeJson = vscode.commands.registerCommand('extension.escapeJson', escapeJsonExtension());
	let formatJson = vscode.commands.registerCommand('extension.formatJson', formatJsonExtension());
	let time = vscode.commands.registerCommand('extension.time', timeExtension());
	let uuid4 = vscode.commands.registerCommand('extension.uuid4', uuidExtension());
	let surprise = vscode.commands.registerCommand('extension.surprise', surpriseExtension());
	let ifttt = vscode.commands.registerCommand('extension.ifttt', iftttExtension());
	let iftttEvents = vscode.commands.registerCommand('extension.iftttEvents', iftttEventsExtension());
	let query = vscode.commands.registerCommand('extension.query', queryExtension(context));

	context.subscriptions.push(surprise);
	context.subscriptions.push(unescapeJson);
	context.subscriptions.push(escapeJson);
	context.subscriptions.push(formatJson);
	context.subscriptions.push(time);
	context.subscriptions.push(uuid4);
	context.subscriptions.push(ifttt);
	context.subscriptions.push(iftttEvents);
	context.subscriptions.push(query);

	init(context);
}

export function deactivate() { }
