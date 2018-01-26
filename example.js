'use strict'
const fs = require('fs')
const markdownit = require('markdown-it')

function findErrorsInFile(md, fileName) {
	console.log(`Checking file: "${fileName}"...`)
	md.render(fs.readFileSync(fileName).toString())
}

function main() {
	let foundErrors = 0
	let foundWarnings = 0
	let currentFile

	const md = markdownit({ html: true })
		.use(require('./'), {
			log: (info) => {
				console.log(`Info: ${info}`)
			},
			errors: (errors) => {
				console.log(`Error: ${currentFile}: ${errors.join(', ')}`)
				foundErrors++
			},
			warnings: (warnings) => {
				console.log(`Warning: ${currentFile}: ${warnings.join(', ')}`)
				foundWarnings++
			},
			filter: (text) => text.replace(/@!@.+@!@/g, ''),
			warnWords: ['colour', 'color'],
			validWords: ['wibble']
		})

	for (const fileToCheck of ['README.md', 'example.md']) {
		currentFile = fileToCheck
		findErrorsInFile(md, fileToCheck)
	}

	if (foundErrors > 0 || foundWarnings > 0) {
		console.log()
	}

	console.log(`Check complete; there were ${foundErrors} errors and ${foundWarnings} warnings.`)
	process.exit(foundErrors)
}

main()
