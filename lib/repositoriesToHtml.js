/* global require, module */

'use strict';

const Rx = require('rx');

module.exports = function(repositories) {
    return repositories
        .map(function(repository) {
            return {
                name: repository.name,
                builds: repository.builds.filter(function(build) {
                    return build.branch === 'master' && build.event_type === 'push' && build.state === 'finished';
                })
            };
        })
        .filter(function(repository) {
            return repository.builds.length > 0;
        })
        .map(function(repository) {
            const status = repository.builds[0].result !== 0 ? 'negative' : 'positive';
            return '<p class="' + status + ' t-size-x18">' +
                repository.name +
                ': ' + repository.builds[0].number +
                ', ' + repository.builds[0].branch +
                '</p>';
        }).join('\n');
};
