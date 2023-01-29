import * as vscode from 'vscode';
import { trackEvent } from '../utility/trackEvent';
const { Configuration, OpenAIApi } = require("openai");

var openai: any;

export function surpriseExtension(): (...args: any[]) => any {
    return () => {
        trackEvent("surprise");
        const apiKey: string | undefined = vscode.workspace.getConfiguration('developerUncle.openai').get("apikey");
        if (apiKey) {
            const configuration = new Configuration({
                apiKey: apiKey,
            });
            openai = new OpenAIApi(configuration);
            callOpenAI();
        } else {
            var items = Array('You are awesome! 😃', 'You are great!',
                'Go confidently in the direction of your dreams and live the life you have imagined.',
                'Always remember you are braver than you believe, stronger than you seem, and smarter than you think.',
                'If you\'re presenting yourself with confidence, you can pull off pretty much anything.',
                'You are off to great places, today is your day. Your mountain is waiting, so get on your way.',
                'It always seems impossible until it is done.', 'Keep your face to the sunshine and you cannot see a shadow.',
                'Once you replace negative thoughts with positive ones, you will start having positive results.',
                'In every day, there are 1,440 minutes. That means we have 1,440 daily opportunities to make a positive impact.',
                'The only time you fail is when you fall down and stay down.');
            vscode.window.showInformationMessage(items[Math.floor(Math.random() * items.length)]);
        }
    };
}

async function callOpenAI() {
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: "Give me one inspirational quote",
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
}
