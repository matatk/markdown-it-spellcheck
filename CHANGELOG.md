Change Log
==========

## [0.3.1](https://github.com/matatk/markdown-it-spellcheck/compare/0.3.0...0.3.1) (2018-01-26)

* Use latest [core-text-spellcheck](https://github.com/matatk/core-text-spellcheck/tree/0.3.0) (0.3.0) API.
* Do not depend on [yargs](http://yargs.js.org) for the example (there is [markdown-spellcheck-cli](https://github.com/matatk/markdown-spellcheck-cli) for that now).
* Update README with links to the CLI tool and fill in placeholders for the possible options in the "hello, world" example.

## [0.3.0](https://github.com/matatk/markdown-it-spellcheck/compare/0.2.0...0.3.0) (2018-01-24)

* Use factored-out [core-text-spellcheck](https://github.com/matatk/core-text-spellcheck) package (which, amongst other things, allows the word lists to be given as empty arrays, in order to make reacting to user settings easier when passing through options).
* Bump dependencies.

## [0.2.0](https://github.com/matatk/markdown-it-spellcheck/compare/0.1.0...0.2.0) (2018-01-23)

* Supports checking within HTML blocks (via [html-text-extract](https://github.com/matatk/html-text-extract)).
* Ensure markdown inline/fenced code is ignored.
* Documentation updates.

## [0.1.0](https://github.com/matatk/markdown-it-spellcheck/compare/0.0.0...0.1.0) (2018-01-17)

* First proper/usable release.
* API uses callbacks (instead of throwing errors).
* Tests (done [TDD](https://en.wikipedia.org/wiki/Test-driven_development)-style from the ground up; good coverage).
* Documentation.
