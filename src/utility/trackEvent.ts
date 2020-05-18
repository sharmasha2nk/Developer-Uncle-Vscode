var rp = require('request');
import * as vscode from 'vscode';
export async function trackEvent(label: string) {
    var data = {
        v: '1',
        tid: "UA-158902673-1",
        cid: vscode.env.machineId,
        t: 'event',
        ec: "command", // category
        ea: label, // action
        ds: vscode.version,
        el: "use", // Event label.
        ev: 1
    };
    rp.post('http://www.google-analytics.com/collect', {
        form: data
    }, function (err: any, response: {
        statusCode: number;
    }) {
        if (err) { console.log(err); }
    });
}

export async function trackException(label: string, exd: string) {
    var data = {
        v: '1',
        tid: "UA-158902673-1",
        cid: vscode.env.machineId,
        t: 'exception',
        ds: vscode.version,
        exd: exd,
        exf: 1
    };
    rp.post('http://www.google-analytics.com/collect', {
        form: data
    }, function (err: any, response: {
        statusCode: number;
    }) {
        if (err) { console.log(err); }
    });
}
