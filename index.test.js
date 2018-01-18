'use strict'
const fs = require('fs')
const path = require('path')

function getFixture(name) {
	return fs.readFileSync(path.join('fixtures', name)).toString()
}

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

	it('throws if options.log is neither null nor a function', () => {
		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				log: 42
			})
		}).toThrow(Error('Log callback is neither null nor a function.'))

		expect(() => {
			require('markdown-it')().use(require('./'), {
				errors: () => {},
				warnings: () => {},
				log: null
			})
		}).not.toThrow()

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

describe('filtering', () => {
	it('filters text', () => {
		const errorsMock = jest.fn()
		const warningsMock = jest.fn()
		const filter = (text) => text.replace(/rite/, ' correctly')
		const md = require('markdown-it')().use(require('./'), {
			errors: errorsMock,
			warnings: warningsMock,
			filter: filter
		})
		// TODO: decide if this should be true
		// expect(md.render('# Spellrite')).toBe('<h1>Spell correctly</h1>\n')
		md.render('# Spellrite')
		expect(errorsMock.mock.calls.length).toBe(0)
	})
})

describe('valid words and warning words', () => {
	// TODO can't test spellings being added to the word list on macOS due to
	//      https://github.com/atom/node-spellchecker/issues/22
	/* it('treats valid words as valid', () => {
		const errorsMock = jest.fn()
		const warningsMock = jest.fn()
		const md = require('markdown-it')().use(require('./'), {
			errors: errorsMock,
			warnings: warningsMock,
			validWords: ['Spellrite']
		})
		md.render('# Spellrite')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})*/

	it('flags warning words as warnings instead of errors', () => {
		const errorsMock = jest.fn()
		const warningsMock = jest.fn()
		const md = require('markdown-it')().use(require('./'), {
			errors: errorsMock,
			warnings: warningsMock,
			warnWords: ['Spellrite']
		})
		md.render('# Spellrite')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(1)
		expect(warningsMock.mock.calls[0][0]).toEqual(['Spellrite'])
	})
})

describe('ignoring code', () => {
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

	it('ignores `code` spans', () => {
		md.render('Surround incorrect `Spellrite` in a code span.')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	it('ignores fenced code blocks', () => {
		md.render(getFixture('ignore-within-fenced.md'))
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})
})
