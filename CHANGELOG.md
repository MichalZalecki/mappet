# CHANGELOG

## 4.3.1

* Fix examples in README.md

## 4.3.0

* Support path array ([#17](https://github.com/MichalZalecki/mappet/pull/17), thanks to [KrzysztofKarol](https://github.com/KrzysztofKarol))
* Replace TSLint with ESLint
* Update dev dependencies

## 4.2.0

* Improve typings for greedy mode ([#11](https://github.com/MichalZalecki/mappet/pull/11), thanks to [rkrupinski](https://github.com/rkrupinski))
* Update dependencies

## 4.1.0

* Update dependencies
* A few minor fixes for strict TypeScript checks in unit tests

## 4.0.0

* Change schema entry to object instead of using tuples
* Drop nested schema support for better type inference in TypeScript; compose mappers instead
* Move to Jest for unit tests

## 3.0.0

* Change schema so its shape reflects its output

## 2.2.2

* Cherry-pick lodash methods ([#5](https://github.com/MichalZalecki/mappet/pull/5), thanks to [bytewiz](https://github.com/bytewiz))

## 2.2.1

* Update dependencies

## 2.2.0

* Update dependencies
* Update tsconfig.json

## 2.1.2

* Update TypeScript to 2.0
* Obtain declarations through npm instead of typings

## 2.1.1

* Check strictMode for true

## 2.1.0

* Add greedy mode

## 2.0.0

*  Stop throwing when entry is filtered out (breaking change)
*  Add `name` option to set custom mapper name

## 1.1.0

* Introduce options object

## 1.0.0

* Import only lodash/get and lodash/set
* Add standalone bundle
* Add linting

## 0.3.0

* Add strict checks mode (breaking change)
* Add per entry filtering (breaking change)
