/* global require, module */

'use strict';

require('pointfree-fantasy').expose(global);

//+ filterBuilds :: Repository -> Repository
const filterBuilds = function(repository) {
    return {
        name: repository.name,
        builds: repository.builds.filter(function(build) {
            return build.branch === 'master' && build.event_type === 'push' && build.state === 'finished';
        })
    };
};

//+ requireBuilds :: [Repository] -> [Repository]
const requireBuilds = function(repositories) {
    return repositories.filter(function(repository) {
        return repository.builds.length > 0;
    })
};

//+ render :: Repository -> Html
const render = function(repository) {
    const status = repository.builds[0].result !== 0 ? 'negative' : 'positive';
    return '<p class="' + status + ' t-size-x18">' +
        repository.name +
        ': ' + repository.builds[0].number +
        ', ' + repository.builds[0].branch +
        '</p>';
};

//+ repositoriesToHtml :: [Repository] -> [Html]
module.exports = compose(map(render), requireBuilds, map(filterBuilds));

