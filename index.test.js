'use strict'

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
			require('markdown-it')().use(require('./'), {
				warnings: () => {}
			})
		}).toThrow(Error('No errors callback specified.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				warnings: () => {},
				errors: 42
			})
		}).toThrow(Error('Errors callback is not a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				warnings: () => {},
				errors: () => {}
			})
		}).not.toThrow()
	})

	it('throws when no warnings callback is specified', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {}
			})
		}).toThrow(Error('No warnings callback specified.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: 42
			})
		}).toThrow(Error('Warnings callback is not a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {}
			})
		}).not.toThrow()
	})

	it('throws if options.log is not a function', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				log: 42
			})
		}).toThrow(Error('Log callback is not a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				log: () => {}
			})
		}).not.toThrow()
	})

	it('throws if options.filter is not a function', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				filter: 42
			})
		}).toThrow(Error('Filter callback is not a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				filter: () => {}
			})
		}).not.toThrow()
	})

	it('throws if validWords is not an array', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				validWords: 42
			})
		}).toThrow(Error('validWords is not an array.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				validWords: []
			})
		}).toThrow(Error('validWords array is empty.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				validWords: ['forty-two']
			})
		}).not.toThrow()
	})

	it('throws if warnWords is not an array', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				warnWords: 42
			})
		}).toThrow(Error('warnWords is not an array.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				warnWords: []
			})
		}).toThrow(Error('warnWords array is empty.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				warnWords: ['forty-two']
			})
		}).not.toThrow()
	})
})

describe('basic rendering', () => {
	it('renders properly', () => {
		const md = require('markdown-it')().use(require('./'), {
			errors: () => {},
			warnings: () => {}
		})
		expect(md.render('# Test')).toBe('<h1>Test</h1>\n')
	})
})

describe('spell-checking', () => {
	// TODO can't test spellings being added to the word list on macOS due to
	//      https://github.com/atom/node-spellchecker/issues/22
	let md
	let errorsMock
	let warningsMock

	beforeEach(() => {
		errorsMock = jest.fn()
		warningsMock = jest.fn()
		md = require('markdown-it')().use(require('./'), {
			errors: errorsMock,
			warnings: warningsMock
		})
	})

	it("doesn't call mocks when everything's spelled correctly", () => {
		expect(md.render('# Test')).toBe('<h1>Test</h1>\n')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	test('flags spelling errors', () => {
		md.render('# Spellrite')
		expect(errorsMock.mock.calls.length).toBe(1)
		expect(errorsMock.mock.calls[0][0]).toEqual(['Spellrite'])
		expect(warningsMock.mock.calls.length).toBe(0)
	})
})
