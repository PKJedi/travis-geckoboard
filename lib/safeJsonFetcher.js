/* global require, module */

'use strict';

require('pointfree-fantasy').expose(global);

const Rx = require('rx');
Rx.Observable.prototype.chain = Rx.Observable.prototype.flatMap;

const https = require('https');

//+ errorNullifier :: NullObject -> (Observable(Try(T)) -> Observable(T))
const errorNullifier = curry(function(nullObject, observable) {
    return observable.catch(Rx.Observable.return(nullObject));
});

//+ httpsStartGet :: Url -> Observable(IncomingResponse)
const httpsStartGet = Rx.Observable.fromCallback(https.get);

//+ collectPartials :: IncomingResponse -> Observable(Try(Object))
const collectPartials = require('./observableFromJsonResponse.js');

//+ observePartials :: Observable(IncomingResponse) -> Observable(Try(Object))
const observePartials = chain(collectPartials);

//+ httpsStartGet ::   Url -> Observable(IncomingResponse)
//+ observePartials ::        Observable(IncomingResponse) -> Observable(Try(Object))
//-------------------------------------------------------------------------------------
//+ fetchJson ::       Url                 ->                 Observable(Try(Object))
const fetchJson = compose(observePartials, httpsStartGet);

//+ safeJsonFetcher :: NullObject -> (Url -> Observable(Object))
module.exports = function(nullObject) {
    //+ nullify :: Observable(Try(T)) -> Observable(T)
    const nullify = errorNullifier(nullObject);

    //+ fetchJson :: Url -> Observable(Try(Object))
    //+ nullify ::          Observable(Try(Object)) -> Observable(Object)
    //-------------------------------------------------------------------
    //+              Url             ->                Observable(Object)
    return compose(nullify, fetchJson);
};

