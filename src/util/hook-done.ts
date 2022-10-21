import { calculateTraitUsage } from './calculate-trait-usage'

import type { Compiler } from 'webpack'
import type { CountComponentsWebpackPlugin } from '../main'

export const hookDone = (
	self: CountComponentsWebpackPlugin,
	compiler: Compiler
): void => {
	return compiler.hooks.done.tap(
		'count-components-webpack-plugin-done',
		(): void => {
			// 维护一下百分比
			calculateTraitUsage(self)

			self.options.isExportExcel !== undefined && self.options.isExportExcel
				? self.toExcel()
				: self.toLog()
		}
	)
}
