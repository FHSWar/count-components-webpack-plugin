'use strict';

var xlsx = require('xlsx');
var lodash = require('lodash');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var exportToExcel = function (self) {
    var trait = self.trait;
    var bookNew = xlsx.utils.book_new, bookAppendSheet = xlsx.utils.book_append_sheet, jsonToSheet = xlsx.utils.json_to_sheet;
    var workbook = bookNew();
    Object.keys(trait).forEach(function (key) {
        var flatObj = __assign(__assign({}, trait[key].components), trait[key].percentage);
        var orderedObj = {};
        Object.keys(trait).forEach(function (innerKey) {
            // js对象键值对是有序的，拍一下方便看
            orderedObj = Object.keys(flatObj[innerKey])
                .sort()
                .reduce(function (acc, cur) {
                acc[cur] = flatObj[cur];
                return acc;
            }, {});
        });
        bookAppendSheet(workbook, 
        // 这json_to_sheet的入参得是个数组
        jsonToSheet([
            __assign({ total: trait[key].total }, orderedObj)
        ]), key);
    });
    var outputDir = self.options.outputDir;
    xlsx.writeFile(workbook, outputDir === undefined ? './dist/count.xlsx' : "./".concat(outputDir, "/count.xlsx"));
};

var calculateTraitUsage = function (self) {
    if (self.options.percentageByMime === undefined)
        return;
    var trait = self.trait;
    var dedupedProjectFileArr = lodash.uniq(self.projectFiles);
    self.options.percentageByMime.forEach(function (mime) {
        // 算出来项目内对应格式的文件数量
        var fileCount = dedupedProjectFileArr.filter(function (fileStr) {
            return fileStr.endsWith(mime);
        }).length;
        Object.keys(trait).forEach(function (path) {
            var tp = trait[path];
            // 每个组件在项目中import次数除以fileCount，得到百分比
            Object.keys(tp.components).forEach(function (component) {
                var decimal = tp.components[component] / fileCount;
                tp.percentage[component] = "".concat((decimal * 100).toFixed(3), "%");
            });
            lodash.mapKeys(tp.percentage, function (_, key) { return "".concat(key, "Per"); });
        });
    });
};

var hookDone = function (self, compiler) {
    return compiler.hooks.done.tap('count-components-webpack-plugin-done', function () {
        // 维护一下百分比
        calculateTraitUsage(self);
        self.options.isExportExcel !== undefined && self.options.isExportExcel
            ? self.toExcel()
            : self.toLog();
    });
};

var hookNormalModuleFactory = function (self, compiler) {
    return compiler.hooks.normalModuleFactory.tap('count-components-webpack-plugin', function (factory) {
        var pathHolderFromObj;
        var path = self.options.path;
        factory.hooks.parser
            .for('javascript/auto')
            .tap('count-components-webpack-plugin', function (parser) {
            parser.hooks.importSpecifier.tap('count-components-webpack-plugin', function (_statement, source, _exportName, identifierName) {
                if (typeof path === 'string') {
                    if (!source.includes(path))
                        return;
                    self.maintainKind(path, identifierName);
                }
                else if (Array.isArray(path)) {
                    path.forEach(function (str) {
                        if (!source.includes(str))
                            return;
                        self.maintainKind(str, identifierName);
                    });
                }
                else if (lodash.isPlainObject(path)) {
                    if (pathHolderFromObj === undefined)
                        pathHolderFromObj = Object.keys(path);
                    pathHolderFromObj.forEach(function (key) {
                        path[key].forEach(function (str) {
                            if (!source.includes(str))
                                return;
                            self.maintainKind(key, identifierName);
                        });
                    });
                }
                else {
                    throw new Error('未适配的path类型❗️');
                }
            });
        });
    });
};

var hookResolveFactory = function (self, compiler) {
    return compiler.resolverFactory.hooks.resolver
        .for('normal')
        .tap('name', function (resolver) {
        // you can tap into resolver.hooks now
        resolver.hooks.result.tap('count-components-webpack-plugin', function (result) {
            // context是存在的，webpack没给标ts类型，神奇
            // descriptionFileRoot context.issuer path
            var issuer = result.context.issuer;
            if (Boolean(issuer) && !issuer.includes('/node_modules/'))
                self.projectFiles.push(issuer);
            return result;
        });
    });
};

var logResult = function (self) {
    console.log('数出来了，算出来了：', JSON.stringify(self.trait, null, 4));
};

var maintainKind = function (self, branch, identifierName) {
    var realBranch = self.trait[branch];
    if (realBranch === undefined) {
        realBranch = {
            total: 0,
            components: {},
            percentage: {}
        };
    }
    realBranch.total = realBranch.total + 1;
    var key = identifierName;
    realBranch.components[key] !== undefined
        ? (realBranch.components[key] += 1)
        : (realBranch.components[key] = 1);
    // 上面为了干净赋了变量，中途可能改变，这里赋回去
    self.trait[branch] = realBranch;
};

var CountComponentsWebpackPlugin = /** @class */ (function () {
    function CountComponentsWebpackPlugin(options) {
        this.options = options;
        this.trait = {};
        this.projectFiles = [];
    }
    CountComponentsWebpackPlugin.prototype.maintainKind = function (branch, identifierName) {
        maintainKind(this, branch, identifierName);
    };
    // 生成excel文件
    CountComponentsWebpackPlugin.prototype.toExcel = function () {
        exportToExcel(this);
    };
    CountComponentsWebpackPlugin.prototype.toLog = function () {
        logResult(this);
    };
    CountComponentsWebpackPlugin.prototype.apply = function (compiler) {
        hookNormalModuleFactory(this, compiler);
        hookResolveFactory(this, compiler);
        hookDone(this, compiler);
    };
    return CountComponentsWebpackPlugin;
}());

exports.CountComponentsWebpackPlugin = CountComponentsWebpackPlugin;
