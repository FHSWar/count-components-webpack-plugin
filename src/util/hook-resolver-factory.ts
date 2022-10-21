import type { Compiler } from 'webpack'
import type { CountComponentsWebpackPlugin } from '../main'

export const hookResolveFactory = (
	self: CountComponentsWebpackPlugin,
	compiler: Compiler
): void => {
	return compiler.resolverFactory.hooks.resolver
		.for('normal')
		.tap('name', (resolver) => {
			// you can tap into resolver.hooks now
			resolver.hooks.result.tap('count-components-webpack-plugin', (result) => {
				// context是存在的，webpack没给标ts类型，神奇
				// descriptionFileRoot context.issuer path
				const issuer: string = (result as any).context.issuer
				if (Boolean(issuer) && !issuer.includes('/node_modules/'))
					self.projectFiles.push(issuer)

				return result
			})
		})
}
