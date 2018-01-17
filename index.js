'use strict'
const SpellChecker = require('spellchecker')

function checkOptions(options) {
	if (options === undefined) {
		throw Error('No options specified.')
	}

	if (typeof options !== 'object') {
		throw Error('Non-object options specified.')
	}

	const optionsRequired = {
		// Which options must be present?
		'errors': true,
		'warnings': true,
		'log': false,
		'filter': false
	}

	for (const option in optionsRequired) {
		if (options.hasOwnProperty(option)) {
			// Everything other than options.log must be a function if present;
			// options.log can be null or a function (so it's easy to set
			// declaratively in the options object when the plugin is loaded).
			if (option !== 'log'
				&& typeof options[option] !== 'function') {
				throw Error(`${capitalise(option)} callback is not a function.`)
			} else if (option === 'log'
				&& options.log !== null && typeof options.log !== 'function') {
				throw Error('Log callback is neither null nor a function.')
			}
		} else if (optionsRequired[option]) {
			throw Error(`No ${option} callback specified.`)
		}
	}

	for (const wordList of ['validWords', 'warnWords']) {
		if (options.hasOwnProperty(wordList)) {
			if (!Array.isArray(options[wordList])) {
				throw Error(`${wordList} is not an array.`)
			} else if (options[wordList].length === 0) {
				throw Error(`${wordList} array is empty.`)
			}
		}
	}
}


function capitalise(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}


function handleSpellingErrors(text, filter, warnWords, error, warn) {
	const preprocessed = filter ? filter(text) : text
	const resultWords = incorrectlySpelledWords(preprocessed)

	if (resultWords.length > 0) {
		// Some mis-spellings may have been flagged by the user as warnings
		// rather than errors (this was put in place to allow language-based
		// mis-spellings through).
		const warningWords =
			resultWords.filter(word => warnWords.includes(word))
		const errantWords =
			resultWords.filter(word => !warnWords.includes(word))

		if (errantWords.length > 0) {
			error(errantWords)
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


module.exports = (md, options) => {
	// Set-up...

	checkOptions(options)

	const log = options.hasOwnProperty('log') && options.log ?
		options.log : () => {}
	const filter = options.hasOwnProperty('filter') ?
		options.filter : null
	const validWords = options.hasOwnProperty('validWords') ?
		options.validWords : []
	const warnWords = options.hasOwnProperty('warnWords') ?
		options.warnWords : []

	for (const word of validWords) {
		SpellChecker.add(word)
		log(`Added to custom dictionary: ${word}`)
	}

	for (const word of warnWords) {
		log(`Added word to warning list: ${word}`)
	}

	function check(text) {
		handleSpellingErrors(
			text, filter, warnWords, options.errors, options.warnings)
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
