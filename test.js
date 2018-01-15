'use strict'
const assert = require('assert')

const tests = []

function runTests() {
	let i = 1
	for (const test of tests) {
		console.log(`Test ${i++}: it ${test.name}`)
		test.func()
	}
}

function it(testName, testFunc) {
	tests.push({
		name: testName,
		func: testFunc
	})
}

it('renders properly', () => {
	const md = require('markdown-it')()
		.use(require('./'))

	assert.strictEqual(md.render('# Test'), '<h1>Test</h1>\n')
})

it('throws on an invalid spelling', () => {
	const md = require('markdown-it')()
		.use(require('./'))

	assert.throws(() => {
		md.render('# Spellrite')
	})
})

// TODO can't test spellings being added to the word list on macOS due to
//      https://github.com/atom/node-spellchecker/issues/22

runTests()
