/* global require */

'use strict';

const Rx = require('rx');
const https = require('https');
const _ = require('underscore');

const config = require('./config.json');

var repos = _(_.clone(config.repos)).each(function(repo) {
    _.extend(repo, {status: {number: '0'}});
});

Rx.Observable
    .interval(config.interval * 1000)
    .flatMap(function() {
        return Rx.Observable.fromArray(_(repos).chain().values().pluck('url').value());
    })
    .flatMap(function(url) {
        return Rx.Observable.fromCallback(https.get)(url);
    })
    .flatMap(function(response) {
        response.setEncoding('utf8');
        return Rx.Observable.fromEvent(response, 'data')
            .buffer(Rx.Observable.fromEvent(response, 'end'))
            .map(function(parts) { return parts.join(''); })
            .map(JSON.parse);
    })
    .flatMap(function(builds) {
        return Rx.Observable.fromArray(builds);
    })
    .filter(function(build) {
        return build.branch === 'master' && build.event_type === 'push' && build.state === 'finished';
    })
    .filter(function(build) {
        var pass = parseInt(build.number, 10) > parseInt(repos[build.repository_id].status.number, 10);

        if (pass) {
            repos[build.repository_id].status = _.clone(build);
        }

        return pass;
    })
    .throttle(10 * 1000)
    .map(function() {
        return _(repos).chain().values().map(function(repo) {
            var status = repo.status.result !== 0 ? 'negative' : 'positive';
            return '<p class="' + status + ' t-size-x18">' +
                repo.name +
                ': ' + repo.status.number +
                ', ' + repo.status.branch +
            '</p>';
        }).join('\n').value();
    })
    .flatMap(function(statusHtml) {
        return Rx.Observable
            .fromCallback(function(callback) {
                var data = JSON.stringify({
                    'api_key': config.geckoboard.api_key,
                    'data': {
                        'item': [
                            {
                                'text': statusHtml,
                                'type': 0
                            }
                        ]
                    }
                });
                var request = https.request({
                    host: 'push.geckoboard.com',
                    port: '443',
                    path: '/v1/send/' + config.geckoboard.widget_key,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length
                    }
                }, callback);
                request.write(data);
                request.end();
            })();
    })
    .flatMap(function(response) {
        response.setEncoding('utf8');
        return Rx.Observable.fromEvent(response, 'data')
            .buffer(Rx.Observable.fromEvent(response, 'end'))
            .map(function(parts) { return parts.join(''); })
            .map(JSON.parse);
    })
    .subscribe(function(response) {
        console.log(response);
    });
