import { mapKeys, uniq } from 'lodash'

import type { CountComponentsWebpackPlugin } from '../main'

export const calculateTraitUsage = (
	self: CountComponentsWebpackPlugin
): void => {
	if (self.options.percentageByMime === undefined) return

	const trait = self.trait
	const dedupedProjectFileArr = uniq(self.projectFiles)

	self.options.percentageByMime.forEach((mime) => {
		// 算出来项目内对应格式的文件数量
		const fileCount = dedupedProjectFileArr.filter((fileStr) =>
			fileStr.endsWith(mime)
		).length

		Object.keys(trait).forEach((path) => {
			const tp = trait[path]

			// 每个组件在项目中import次数除以fileCount，得到百分比
			Object.keys(tp.components).forEach((component) => {
				const decimal = tp.components[component] / fileCount
				tp.percentage[component] = `${(decimal * 100).toFixed(3)}%`
			})

			tp.percentage = mapKeys(tp.percentage, (_, key) => `${key}Per`)
		})
	})
}
