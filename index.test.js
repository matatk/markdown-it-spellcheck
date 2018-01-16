'use strict'

test('renders properly', () => {
	const md = require('markdown-it')()
		.use(require('./'))

	expect(md.render('# Test')).toBe('<h1>Test</h1>\n')
})

test('throws on an invalid spelling', () => {
	const md = require('markdown-it')()
		.use(require('./'))

	expect(() => {
		md.render('# Spellrite')
	}).toThrow()
})

// TODO can't test spellings being added to the word list on macOS due to
//      https://github.com/atom/node-spellchecker/issues/22
