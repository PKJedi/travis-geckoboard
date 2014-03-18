/* global require, module */

'use strict';

const Rx = require('rx');

module.exports = function(response) {
    response.setEncoding('utf8');
    return Rx.Observable.fromEvent(response, 'data')
        .buffer(Rx.Observable.fromEvent(response, 'end'))
        .map(function(parts) { return parts.join(''); })
        .map(JSON.parse);
};
