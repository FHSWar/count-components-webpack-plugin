import { isPlainObject } from 'lodash'

import type { Compiler } from 'webpack'
import type { CountComponentsWebpackPlugin } from '../main'

export const hookNormalModuleFactory = (
	self: CountComponentsWebpackPlugin,
	compiler: Compiler
): void => {
	return compiler.hooks.normalModuleFactory.tap(
		'count-components-webpack-plugin',
		(factory): void => {
			let pathHolderFromObj: string[]
			const path = self.options.path

			factory.hooks.parser
				.for('javascript/auto')
				.tap('count-components-webpack-plugin', (parser) => {
					parser.hooks.importSpecifier.tap(
						'count-components-webpack-plugin',
						(
							_statement: string,
							source: string,
							_exportName: string,
							identifierName: string
						) => {
							if (typeof path === 'string') {
								if (!source.includes(path)) return

								self.maintainKind(path, identifierName)
							} else if (Array.isArray(path)) {
								path.forEach((str) => {
									if (!source.includes(str)) return

									self.maintainKind(str, identifierName)
								})
							} else if (isPlainObject(path)) {
								if (pathHolderFromObj === undefined)
									pathHolderFromObj = Object.keys(path)

								pathHolderFromObj.forEach((key) => {
									path[key].forEach((str) => {
										if (!source.includes(str)) return

										self.maintainKind(key, identifierName)
									})
								})
							} else {
								throw new Error('未适配的path类型❗️')
							}
						}
					)
				})
		}
	)
}
