import * as vscode from 'vscode';
import { trackEvent, trackException } from '../utility/trackEvent';
var rp = require('request');

export function iftttExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("ifttt");
		const defaultEvent: string | undefined = vscode.workspace.getConfiguration('developerUncle.IFTTT').get("defaultEvent");
		triggerEvent(defaultEvent);
	};
}

export function iftttEventsExtension(): (...args: any[]) => any {
	return () => {
		trackEvent("iftttEvents");
		triggerEvent(undefined);
	};
}

function triggerEvent(event: string | undefined) {
	const iftttKey = vscode.workspace.getConfiguration('developerUncle.IFTTT.credentials').get("key");
	if (iftttKey) {
		if (!event) {
			const events: string | undefined = vscode.workspace.getConfiguration('developerUncle.IFTTT').get("events");
			if (!events) {
				vscode.window.showWarningMessage("Configure some IFTTT events in the settings.");
				return;
			}
			const quickPick = vscode.window.createQuickPick();
			quickPick.placeholder = "Select any one event to trigger."
			quickPick.items = String(events)?.split(",").map(label => ({ label }));
			quickPick.onDidChangeSelection(selections => {
				quickPick.dispose();
				event = selections[0].label;
				trigger(event, iftttKey);
			});
			quickPick.onDidHide(() => quickPick.dispose());
			quickPick.show();
		} else {
			trigger(event, iftttKey);
		}
	}
	else {
		const quickPick = vscode.window.createQuickPick();
		quickPick.placeholder = "IFTTT key is not set. Do you want to configure it now?";
		quickPick.items = ["Yes, open settings. (Search for Developer Uncle to configure)", "No, I'll do it later."].map(label => ({ label }));
		quickPick.onDidChangeSelection(selections => {
			quickPick.dispose();
			if (selections[0].label === "Yes, open settings. (Search for Developer Uncle to configure)") {
				vscode.commands.executeCommand('workbench.action.openGlobalSettings');
			} else {
				vscode.window.showWarningMessage("Configure IFTTT key in the settings.");
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
	}
}

async function trigger(event: string | undefined, iftttKey: unknown) {
	const eventsWhichRequiresValue1 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("eventsWhichRequiresValue1");
	const eventsWhichRequiresValue2 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("eventsWhichRequiresValue2");
	const eventsWhichRequiresValue3 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("eventsWhichRequiresValue3");
	const value1 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("value1");
	const value2 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("value2");
	const value3 = vscode.workspace.getConfiguration('developerUncle.IFTTT.parameters').get("value3");
	var data: {
		[k: string]: any;
	} = {};
	if (eventsWhichRequiresValue1 && String(eventsWhichRequiresValue1).split(",").includes(String(event))) {
		if (value1) {
			data.value1 = String(value1);
		} else {
			const input = await vscode.window.showInputBox({ "prompt": "Enter value for value1 parameter." });
			if (!input) {
				vscode.window.showWarningMessage("Event cancelled.");
				return;
			}
			data.value1 = input;
		}
	}
	if (eventsWhichRequiresValue2 && String(eventsWhichRequiresValue2).split(",").includes(String(event))) {
		if (value2) {
			data.value2 = String(value2);
		} else {
			const input = await vscode.window.showInputBox({ "prompt": "Enter value for value2 parameter." });
			if (!input) {
				vscode.window.showWarningMessage("Event cancelled.");
				return;
			}
			data.value2 = input;
		}
	}
	if (eventsWhichRequiresValue3 && String(eventsWhichRequiresValue3).split(",").includes(String(event))) {
		if (value3) {
			var editor = vscode.window.activeTextEditor;
			if (editor && editor.selection) {
				var selection = editor.selection;
				data.value3 = editor.document.getText(selection);
			}
		} else {
			const input = await vscode.window.showInputBox({ "prompt": "Enter value for value3 parameter." });
			if (!input) {
				vscode.window.showWarningMessage("Event cancelled.");
				return;
			}
			data.value3 = input;
		}
	}
	var options = {
		'method': 'POST',
		'url': 'https://maker.ifttt.com/trigger/' + event + '/with/key/' + iftttKey,
		'headers': {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	};
	rp(options, function (error: string | undefined, response: {
		body: any;
	}) {
		if (error) {
			vscode.window.showErrorMessage("Some error connecting with IFTTT. 👾");
			trackException("ifttt", error);
		}
		vscode.window.showInformationMessage("IFTTT event " + event + " triggered successfully. 🚀");
	});
}


