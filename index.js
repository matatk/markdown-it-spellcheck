'use strict'
const hte = require('html-text-extract')

module.exports = (md, options) => {
	const sc = require('core-text-spellcheck')(options)

	// Markdown spell-checking bits...

	const defaultRendererImage = md.renderer.rules.image

	md.renderer.rules.image = (tokens, idx, options, env, self) => {
		sc.check(self.renderInlineAsText(tokens[idx].children, options, env))

		return defaultRendererImage(tokens, idx, options, env, self)
	}


	const defaultRendererText = md.renderer.rules.text

	md.renderer.rules.text = (tokens, idx, options, env, self) => {
		sc.check(tokens[idx].content)

		return defaultRendererText(tokens, idx, options, env, self)
	}


	const defaultRendererHtmlBlock = md.renderer.rules.html_block

	// eslint-disable-next-line camelcase
	md.renderer.rules.html_block = (tokens, idx, options, env, self) => {
		const html = tokens[idx].content
		if (html) {
			sc.check(hte(html, true))
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
			// sc.log(`HTML inline: ${html}`)
			console.log(`HTML inline: ${html}`)
		}

		return defaultRendererHtmlInline(tokens, idx, options, env, self)
	}
}
