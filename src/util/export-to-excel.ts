import { utils, writeFile } from 'xlsx'

import type { CountComponentsWebpackPlugin } from '../main'

export const exportToExcel = (self: CountComponentsWebpackPlugin): void => {
	const trait = self.trait
	const {
		book_new: bookNew,
		book_append_sheet: bookAppendSheet,
		json_to_sheet: jsonToSheet
	} = utils

	const workbook = bookNew()
	Object.keys(trait).forEach((key) => {
		const flatObj = { ...trait[key].components, ...trait[key].percentage }

		let orderedObj: typeof flatObj = {}
		Object.keys(flatObj).forEach((innerKey) => {
			// js对象键值对是有序的，排一下方便看
			orderedObj = Object.keys(flatObj)
				.sort()
				.reduce<typeof flatObj>((acc, cur) => {
					acc[cur] = flatObj[cur]
					return acc
				}, {})
		})

		bookAppendSheet(
			workbook,
			// 这json_to_sheet的入参得是个数组
			jsonToSheet([
				{
					total: trait[key].total,
					...orderedObj
				}
			]),
			key
		)
	})

	const outputDir = self.options.outputDir
	writeFile(
		workbook,
		outputDir === undefined ? './dist/count.xlsx' : `./${outputDir}/count.xlsx`
	)
}
