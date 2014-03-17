# Travis to Geckoboard daemon

A daemon that fetches [Travis CI](https://travis-ci.org/) job information
and pushes it into a [Geckoboard](http://www.geckoboard.com/) custom text widget.

## Features

- Works for open and private repositories
- Configurable Travis CI fetch interval
- Only pushes to Geckoboard after a new build

## Limitations

- Currently only watches finished builds spawned by pushes to the _master_ branch
- Geckoboard push data is not configurable or templated
- No tests, will die in case of network issues
- Likely will not work with a large amount of repositories
- "my first" level [Reactive Extensions](https://github.com/Reactive-Extensions/RxJS) based code

## Configure

Copy _config.example.json_ to _config.json_ and edit to your needs.

## Run

npm install
node --harmony daemon.js

