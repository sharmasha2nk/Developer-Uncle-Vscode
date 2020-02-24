import * as vscode from 'vscode';
var rp = require('request');
var Cookie = require('request-cookies').Cookie;
import { trackEvent, trackException } from '../utility/trackEvent';
const uuidv4 = require('uuid/v4');

export function queryExtension(context: vscode.ExtensionContext): (...args: any[]) => any {
    return () => {
        trackEvent("query")
        query(context);
    };
}

async function query(context: vscode.ExtensionContext) {
    const input = await vscode.window.showInputBox({ "prompt": "How can I help?" });
    if (input) {
        var options = {
            'method': 'POST',
            'url': 'https://router.triniti.ai/morfeus/v1/channels/2017w32821678795/authMessage',
            'headers': {
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'en-gb',
                'Host': 'router.triniti.ai',
                'Origin': 'https://demo.triniti.ai',
                'Cookie': 'applicationId=' + context.globalState.get("applicationId") + '; sid=' + context.globalState.get("sid"),
            },
            body: JSON.stringify({ "sdkVersion": "2.5.3", "sdkType": "w", "messageId": String(uuidv4()), "messageType": "text", "messageContent": input, "langCode": "en" })

        };
        rp(options, function (error: string | undefined, response: { body: any; }) {
            if (error) {
                vscode.window.showErrorMessage("Some error connecting with Developer Uncle.");
                trackException("query", error);
            }
            var text = JSON.parse(response.body).messages[0]?.message?.text;
            if (text && text.startsWith("command://")) {
                var command = text.substr(10);
                vscode.commands.executeCommand(command);
            } else if (text && text.startsWith("copy://")) {
                var textToCopy = text.substr(10);
                vscode.env.clipboard.writeText(textToCopy).then(() => vscode.window.showInformationMessage('Copied to your clipboard!'));
            } else if (text && text != "ERROR") {
                vscode.window.showInformationMessage(text);
            } else {
                vscode.window.showInformationMessage("Or I can help you Google it? [Google it](https://www.google.com/search?q=" + encodeURI(input.replace(")", "")) + ")");
                vscode.window.showInformationMessage("I am sorry I couldn't understand that. I'll mark this one for learning. Do you want to rephrase your question?");
                trackEvent("query_not_answered");
            }
        });
    }
}

export async function init(context: vscode.ExtensionContext) {
    if (context.globalState.get("applicationId")) {
        console.debug("applicationId exist");
    } else {
        var options = {
            'method': 'POST',
            'url': 'https://router.triniti.ai/morfeus/v1/channels/2017w32821678795/init',
            'headers': {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Host': 'router.triniti.ai',
                'Origin': 'https://demo.triniti.ai'
            },
            body: JSON.stringify({ "sdkVersion": "2.5.3", "sdkType": "w", "messageId": String(uuidv4()), "messageType": "text", "messageContent": "hi", "langCode": "en" })

        };
        rp(options, function (error: string | undefined, response: { body: any, headers: any }) {
            if (error) {
                vscode.window.showErrorMessage("Some error connecting with Developer Uncle.");
                trackException("queryinit", error);
            }
            var rawcookies = response.headers['set-cookie'];
            for (var i in rawcookies) {
                var cookie = new Cookie(rawcookies[i]);
                console.log(cookie.key, cookie.value, cookie.expires);
                if (cookie.key === "applicationId") {
                    context.globalState.update("applicationId", cookie.value);
                }
                if (cookie.key === "sid") {
                    context.globalState.update("sid", cookie.value);
                }
            }
        });
    }
}
