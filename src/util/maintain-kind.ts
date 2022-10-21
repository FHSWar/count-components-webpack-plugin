import type { CountComponentsWebpackPlugin } from '../main'

export const maintainKind = (
	self: CountComponentsWebpackPlugin,
	branch: string,
	identifierName: string
): void => {
	let realBranch = self.trait[branch]

	if (realBranch === undefined) {
		realBranch = {
			total: 0,
			components: {},
			percentage: {}
		}
	}

	realBranch.total = realBranch.total + 1
	const key = identifierName

	realBranch.components[key] !== undefined
		? (realBranch.components[key] += 1)
		: (realBranch.components[key] = 1)

	// 上面为了干净赋了变量，中途可能改变，这里赋回去
	self.trait[branch] = realBranch
}
