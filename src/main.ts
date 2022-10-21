import {
	exportToExcel,
	hookDone,
	hookNormalModuleFactory,
	hookResolveFactory,
	logResult,
	maintainKind
} from './util'

import type { Compiler } from 'webpack'

interface CountType {
	[key: string]: number
}
interface Options {
	path: string | string[] | Record<string, string[]> // 文件的路径
	isExportExcel?: boolean
	outputDir?: string
	percentageByMime: string[]
}

export class CountComponentsWebpackPlugin {
	options: Options
	projectFiles: string[]
	// 根据path数处的组件名称和数量
	trait: Record<
		string,
		{
			components: CountType
			percentage: Record<string, string>
			total: number
		}
	>

	constructor(options: Options) {
		this.options = options
		this.trait = {}
		this.projectFiles = []
	}

	maintainKind(branch: string, identifierName: string): void {
		maintainKind(this, branch, identifierName)
	}

	// 生成excel文件
	toExcel(): void {
		exportToExcel(this)
	}

	toLog(): void {
		logResult(this)
	}

	apply(compiler: Compiler): void {
		hookNormalModuleFactory(this, compiler)
		hookResolveFactory(this, compiler)
		hookDone(this, compiler)
	}
}
