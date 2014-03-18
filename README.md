# Travis to Geckoboard daemon

A daemon that fetches [Travis CI](https://travis-ci.org/) job information
and pushes it into a [Geckoboard](http://www.geckoboard.com/) custom text widget.

## Features

- Works for open and private repositories
- Configurable Travis CI fetch interval

## Limitations

- Currently only watches finished builds spawned by pushes to the _master_ branch
- Geckoboard push data is not configurable or templated
- No tests

## Configure

Copy `config.example.json` to `config.json` and edit to your needs.

## Run

    npm install
    node --harmony daemon.js

