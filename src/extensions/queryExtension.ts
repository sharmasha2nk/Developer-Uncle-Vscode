import * as vscode from 'vscode';
var rp = require('request');
var Cookie = require('request-cookies').Cookie;
import { trackEvent, trackException } from '../utility/trackEvent';
const uuidv4 = require('uuid/v4');
const { Configuration, OpenAIApi } = require("openai");

var openai: any;

export function queryExtension(context: vscode.ExtensionContext): (...args: any[]) => any {
    return () => {
        trackEvent("query");
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
                callOpenAI(input);
                trackException("query", error);
            } else {
                var text = JSON.parse(response.body).messages[0]?.message?.text;
                if (text && isJson(text)) {
                    const faqResponse = JSON.parse(text);
                    vscode.commands.executeCommand(faqResponse.command).then(undefined, err => {
                        if (faqResponse.message) {
                            vscode.window.showInformationMessage(faqResponse.message);
                        }
                        vscode.window.showInformationMessage("I suggest using " + faqResponse.extensionName + " extension.", "Download", "Extension Details").then(selection => {
                            console.log(selection);
                            if (selection === "Download") {
                                vscode.env.openExternal(vscode.Uri.parse("vscode:extension/" + faqResponse.uniqueIdentifier));
                            } else {
                                vscode.env.openExternal(vscode.Uri.parse("https://marketplace.visualstudio.com/items?itemName=" + faqResponse.uniqueIdentifier));
                            }
                        });
                        vscode.window.showInformationMessage("I see you don't have an extension to handle it.");
                    });
                } else if (text && text.startsWith("command://")) {
                    var command = text.substr(10);
                    vscode.commands.executeCommand(command);
                } else if (text && text.startsWith("copy://")) {
                    var textToCopy = text.substr(7);
                    vscode.env.clipboard.writeText(textToCopy).then(() => vscode.window.showInformationMessage('Copied to your clipboard!'));
                } else if (text && text !== "ERROR") {
                    vscode.window.showInformationMessage(text);
                } else {
                    callOpenAI(input);
                }
            }
        });
    }
}

function isJson(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
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

async function callOpenAI(query: String) {
    const apiKey: string | undefined = vscode.workspace.getConfiguration('developerUncle.openai').get("apikey");
    if (apiKey) {
        const configuration = new Configuration({
            apiKey: apiKey,
        });
        openai = new OpenAIApi(configuration);
        try {
            trackEvent("openai");
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: query,
                temperature: 1,
                max_tokens: 1000,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            });
            vscode.window.showInformationMessage(response.data.choices[0].text);
        } catch (error) {
            vscode.window.showErrorMessage("Error calling OpenAI, please check the APIKey is valid!");
        }
    } else {
        vscode.window.showErrorMessage("Some error connecting with Developer Uncle.");
    }
}
