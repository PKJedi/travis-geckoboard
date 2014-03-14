/* global require */

'use strict';

const Rx = require('rx');
const https = require('https');
const _ = require('underscore');

// TODO repo config sanity

var repos = {
    7900: {
        name: 'xi-project/xi-filelib',
        status: {number: "0"}
    },
    30296: {
        name: 'xi-project/xi-bundle-filelib',
        status: {number: "0"}
    }
};

// TODO travis token(s)

var repoUrl = function(repo) {
    return 'https://api.travis-ci.org/repos/' + repo + '/builds';
};

Rx.Observable
    .interval(60 * 1000)
    .flatMap(function() {
        return Rx.Observable.fromArray(_(repos).chain().values().pluck('name').map(repoUrl).value());
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
    .throttle(5 * 1000)
    .subscribe(function(build) {
        console.log(repos);
        // TODO push to geckoboard
    });
