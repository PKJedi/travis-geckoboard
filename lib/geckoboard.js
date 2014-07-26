/* global require, module */

'use strict';

const Rx = require('rx');
const https = require('https');
const observableFromJsonResponse = require('./observableFromJsonResponse.js');

exports.customText = function(apiKey, widgetKey, items) {
    return Rx.Observable
        .fromCallback(function(callback) {
            const data = JSON.stringify({
                api_key: apiKey,
                data: {item: items}
            });
            const options = {
                host: 'push.geckoboard.com',
                port: '443',
                path: '/v1/send/' + widgetKey,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };
            const request = https.request(options, callback);
            request.write(data);
            request.end();
        })()
        .flatMap(observableFromJsonResponse)
        .catch(Rx.Observable.return({error: 'An error occurred while pushing to geckoboard'}));
};
