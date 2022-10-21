# Introduce

## Install

```shell
npm install count-components-webpack-plugin
```

## Use

```js
import { CountComponentsWebpackPlugin } from 'count-components-webpack-plugin'

// in webpack plugin array
new CountComponentsWebpackPlugin({
    path: {
        uiLib: ['vant'],
        projectComponents: ['@/components']
    },
    percentageByMime: ['vue'],
    isExportExcel: true
})
```
