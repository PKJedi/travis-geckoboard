/* global require, module */

'use strict';

require('pointfree-fantasy').expose(global);

const Rx = require('rx');
const https = require('https');

//+ safeJsonFetcher :: NullObject -> (Url -> Observable(Object))
const safeJsonFetcher = require('./safeJsonFetcher.js');

//+ repositoryName :: Url -> String
const repositoryName = function(url) {
    return url.match(/repos\/([^\/]+\/[^\/]+)\/builds/)[1];
};

//+ repositoryNamer :: String -> ([Build] -> Repository)
const repositoryNamer = function(name) {
    return function(builds) {
        return {
            name: name,
            builds: builds
        };
    };
};

//+ repositoryName ::     Url -> String
//+ repositoryNamer ::           String -> ([Build] -> Repository)
//------------------------------------------------------------
//+ repositoryUrlNamer :: Url       ->     ([Build] -> Repository)
const repositoryUrlNamer = compose(repositoryNamer, repositoryName);

//+ fetchRepository :: Url -> Observable(Repository)
module.exports = function(url) {
    //+ name :: [Build] -> Repository
    const name = repositoryUrlNamer(url);

    //+ safeFetchBuilds :: Url -> Observable([Build])
    const safeFetchBuilds = safeJsonFetcher([]);

    //+ safeFetchBuilds :: Url -> Observable([Build])
    //+ map(name) ::              Observable([Build]) -> Observable(Repository)
    //--------------------------------------------------------------------------------------------------
    //+                    Url           ->              Observable(Repository)
    return compose(map(name), safeFetchBuilds)(url);
};
