'use strict'
// TODO can't test spellings being added to the word list on macOS due to
//      https://github.com/atom/node-spellchecker/issues/22

describe('options-checking', () => {
	it('throws when no options are specified', () => {
		expect(() => {
			require('markdown-it')().use(require('./'))
		}).toThrow(Error('No options specified.'))
	})

	it('throws when a non-object is given', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), 42)
		}).toThrow(Error('Non-object options specified.'))
	})

	it('throws when no errors callback is specified', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {})
		}).toThrow(Error('No errors callback specified.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: 42
			})
		}).toThrow(Error('Errors callback is not a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {}
			})
		}).not.toThrow()
	})
})

describe('basic functionality', () => {
	let md

	beforeEach(() => {
		md = require('markdown-it')().use(require('./'), {
			errors: () => {}
		})
	})

	test('renders properly', () => {
		expect(md.render('# Test')).toBe('<h1>Test</h1>\n')
	})

	test('throws on an invalid spelling', () => {
		expect(() => {
			md.render('# Spellrite')
		}).toThrow()
	})
})
