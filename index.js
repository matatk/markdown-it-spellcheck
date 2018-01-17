'use strict'
const SpellChecker = require('spellchecker')

function checkOptions(options) {
	if (options === undefined) {
		throw Error('No options specified.')
	}

	if (typeof options !== 'object') {
		throw Error('Non-object options specified.')
	}

	for (const option of ['errors', 'warnings']) {
		if (options.hasOwnProperty(option)) {
			if (typeof options[option] !== 'function') {
				throw Error(`${capitaliseFirst(option)} callback is not a function.`)
			}
		} else {
			throw Error(`No ${option} callback specified.`)
		}
	}
}


function capitaliseFirst(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}


function handleSpellingErrors(text, filter, warnWords, errorsAsWarnings, warn) {
	const preprocessed = filter ? filter(text) : text
	const resultWords = incorrectlySpelledWords(preprocessed)

	if (resultWords.length > 0) {
		// Some mis-spellings may have been flagged by the user as warnings
		// rather than errors (this was put in place to allow language-based
		// mis-spellings through).
		const warningWords = resultWords.filter(
			word => warnWords.includes(word))
		const errantWords = resultWords.filter(
			word => !warnWords.includes(word))

		if (errantWords.length > 0) {
			if (errorsAsWarnings) {
				warn(errantWords)
			} else {
				throw Error(errantWords)
			}
		}

		if (warningWords.length > 0) {
			warn(warningWords)
		}
	}
}


function incorrectlySpelledWords(text) {
	const results = SpellChecker.checkSpelling(text)
	const out = []
	if (results) {
		for (const result of results) {
			out.push(text.substring(result.start, result.end))
		}
	}
	return out
}


function checkForSetKey(object, key) {
	return object && object.hasOwnProperty(key) && object[key]
}


function warnGuard(options, condition, name) {
	if (condition && !options.warn) {
		console.log(`Caution: options.${name} is set, but an options.warn function has not been provided; warnings will not be shown.`)
	}
}


module.exports = (md, options) => {
	checkOptions(options)

	// Set-up...

	const filter = checkForSetKey(options, 'filter') ? options.filter : null

	const errorsAsWarnings = checkForSetKey(options, 'errorsAsWarnings') ?
		Boolean(options.errorsAsWarnings) : false

	const warn = checkForSetKey(options, 'warn') ? options.warn : () => {}

	warnGuard(options, errorsAsWarnings, 'errorsAsWarnings')

	const log = checkForSetKey(options, 'log') ? options.log : () => {}

	if (checkForSetKey(options, 'validWords')) {
		for (const word of options.validWords) {
			SpellChecker.add(word)
			log(`Added to custom dictionary: ${word}`)
		}
	}

	const warnWords = checkForSetKey(options, 'warnWords') ?
		options.warnWords : []

	for (const word of warnWords) {
		log(`Added word to warning list: ${word}`)
	}

	warnGuard(options, warnWords.length > 0, 'warnWords')

	function check(text) {
		handleSpellingErrors(text, filter, warnWords, errorsAsWarnings, warn)
	}


	// Actual spell-checking bits...

	const defaultRendererImage = md.renderer.rules.image

	md.renderer.rules.image = (tokens, idx, options, env, self) => {
		check(self.renderInlineAsText(tokens[idx].children, options, env))

		return defaultRendererImage(tokens, idx, options, env, self)
	}


	const defaultRendererText = md.renderer.rules.text

	md.renderer.rules.text = (tokens, idx, options, env, self) => {
		check(tokens[idx].content)

		return defaultRendererText(tokens, idx, options, env, self)
	}


	const defaultRendererHtmlBlock = md.renderer.rules.html_block

	// eslint-disable-next-line camelcase
	md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
		const html = tokens[idx].content
		if (html) {
			log(`HTML block: ${html}`)
		}

		return defaultRendererHtmlBlock(tokens, idx, options, env, self)
	}


	const defaultRendererHtmlInline = md.renderer.rules.html_inline

	// eslint-disable-next-line camelcase
	md.renderer.rules.html_inline = (tokens, idx, options, env, self) => {
		// Note: markdown-it treats <kbd>Right</kbd> as
		//       * <kbd> - inline HTML
		//       * Right - text (checked elsewhere)
		//       * </kbd> - inline HTML
		const html = tokens[idx].content
		if (html) {
			log(`HTML inline: ${html}`)
		}

		return defaultRendererHtmlInline(tokens, idx, options, env, self)
	}
}
