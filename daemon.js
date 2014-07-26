/* global require */

'use strict';

require('pointfree-fantasy').expose(global);

const Rx = require('rx');
Rx.Observable.prototype.chain = Rx.Observable.prototype.flatMap;

const config = require('./config.json');
const fetchRepository = require('./lib/travis.js');
const geckoboard = require('./lib/geckoboard.js');
const renderRepositories = require('./lib/repositoriesToHtml.js');

const fetchRepositories = compose(Rx.Observable.zipArray, map(fetchRepository));

const pushToWidget = curry(geckoboard.customText)(config.geckoboard.api_key, config.geckoboard.widget_key);

const htmlsToWidgetItems = function(htmls) {
    return [{text: htmls.join('\n'), type: 0}];
};

const pushHtmlsAsWidgetItems = compose(pushToWidget, htmlsToWidgetItems);

const fetchRenderPush = compose(chain(pushHtmlsAsWidgetItems), map(renderRepositories), chain(fetchRepositories));

const repositoriesTrigger = Rx.Observable.interval(config.interval * 1000).map(K(config.repos));

fetchRenderPush(repositoriesTrigger)
    .subscribe(
        function(response) {
            console.log(response);
        },
        function(error) {
            console.log(error);
        }
    );
