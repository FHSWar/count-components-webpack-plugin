import type { CountComponentsWebpackPlugin } from '../main'

export const logResult = (self: CountComponentsWebpackPlugin): void => {
	console.log('数出来了，算出来了：', JSON.stringify(self.trait, null, 4))
}
