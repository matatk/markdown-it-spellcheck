'use strict'
const fs = require('fs')
const path = require('path')

function getFixture(name) {
	return fs.readFileSync(path.join('fixtures', name)).toString()
}

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

	it("doesn't call errors()/warnings() when all's spelled correctly", () => {
		expect(md.render('# Test')).toBe('<h1>Test</h1>\n')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	test('flags spelling errors', () => {
		expect(md.render('# Spellrite')).toBe('<h1>Spellrite</h1>\n')
		expect(errorsMock.mock.calls.length).toBe(1)
		expect(errorsMock.mock.calls[0][0]).toEqual(['Spellrite'])
		expect(warningsMock.mock.calls.length).toBe(0)
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

describe('checking HTML', () => {
	let md
	let errorsMock
	let warningsMock

	beforeEach(() => {
		errorsMock = jest.fn()
		warningsMock = jest.fn()
		md = require('markdown-it')({ html: true }).use(require('./'), {
			errors: errorsMock,
			warnings: warningsMock
		})
	})

	// TODO this needs to check attributes of the tags? And note that the thing
	// inside the tag is NOT part of the inline HTML as far as markdown-it is
	// concerned.

	it('checks in-line HTML', () => {  // 'inline' errors on Travis
		md.render('Some in-line <span>Spellrite</span> HTML.')
		expect(errorsMock.mock.calls.length).toBe(1)
		expect(errorsMock.mock.calls[0][0]).toEqual(['Spellrite'])
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	it('ignores HTML tag names that are not words', () => {
		md.render('Use the <kbd>Tab</kbd> key.')
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	it('checks HTML blocks', () => {
		md.render(getFixture('html-block.md'))
		expect(errorsMock.mock.calls.length).toBe(1)
		expect(errorsMock.mock.calls[0][0]).toEqual(['Spellrite'])
		expect(warningsMock.mock.calls.length).toBe(0)
	})

	it('ignores the content of <code> elements in blocks', () => {
		md.render(getFixture('html-block-with-code.md'))
		expect(errorsMock.mock.calls.length).toBe(0)
		expect(warningsMock.mock.calls.length).toBe(0)
	})
})
