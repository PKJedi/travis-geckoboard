/* global require */

'use strict';

const Rx = require('rx');
const config = require('./config.json');
const travis = require('./lib/travis.js');
const geckoboard = require('./lib/geckoboard.js');
const repositoriesToHtml = require('./lib/repositoriesToHtml.js');

Rx.Observable

    // Every config.interval seconds,
    .interval(config.interval * 1000)

    // fetch build information from Travis CI.
    .flatMap(function() {
        return travis(config.repos);
    })

    // Format the build information and
    .map(repositoriesToHtml)

    // push it onto Geckoboard.
    .flatMap(function(html) {
        return geckoboard.customText(
            config.geckoboard.api_key,
            config.geckoboard.widget_key,
            [{text: html, type: 0}]
        );
    })

    // Output Geckoboard response or possible errors.
    .subscribe(
        function(response) {
            console.log(response);
        },
        function(error) {
            console.log(error);
        }
    );
