/* global require, module */

'use strict';

const Rx = require('rx');
const https = require('https');
const observableFromJsonResponse = require('./observableFromJsonResponse.js');

const repositoryName = function(url) {
    return url.match(/repos\/([^\/]+\/[^\/]+)\/builds/)[1];
};

module.exports = function(urls) {
    const observables = urls.map(function(url) {
        return Rx.Observable
            .fromCallback(https.get)(url)
            .flatMap(observableFromJsonResponse)
            .map(function(builds) {
                return {
                    name: repositoryName(url),
                    builds: builds
                };
            })
            .catch(function() {
                return Rx.Observable.return({
                    name: repositoryName(url),
                    builds: []
                });
            });
    });

    return Rx.Observable.zipArray(observables);
};
