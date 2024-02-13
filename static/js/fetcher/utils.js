var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import Path from './path-browserify.js';
var defaultMacroMap = function () { return new Map([["TRUE", true]]); };
var defaultFileDataOptions = {
    macros: defaultMacroMap(),
    filterComments: false,
    filterMacros: false,
};
/**
 * read a file and return throught a promise its content (see FileData interface)
 * @param fullpath the absolute path of the file to get data
 * @param options FileDataOptions to applicate to the file reading
 * @returns a promise of FileData or an error
 */
export function getFileData(fullpath, options) {
    if (options === void 0) { options = defaultFileDataOptions; }
    return new Promise(function (resolve, rejected) {
        getRawFile(fullpath)
            .then(function (x) {
        });
        getRawFile(fullpath)
            .then(function (data) {
            if (options.filterComments) {
                data = filterComments(data);
            }
            if (options.filterMacros) {
                return resolve(filterMacros(data, options.macros));
            }
            return resolve({ data: data, macros: defaultMacroMap() });
        })
            .catch(function (err_exist) {
            var err = "couldn't read filefile: ".concat(fullpath, ", reason: ").concat(err_exist);
            return rejected(err);
        });
    });
}
/**
 * get multiple files data
 * @param fullFilePathList an array of absolute path to files
 * @param options FileDataOptions that will be applied to the reading of all files
 * @returns the promise of a concatenated result of all the data of all files, (the order isn't tested yet)
 * or may be an error if any file didn't got read as planed
 */
export function getMulFilesData(fullFilePathList, options) {
    var e_1, _a;
    if (options === void 0) { options = defaultFileDataOptions; }
    var promiseArray = [];
    try {
        for (var fullFilePathList_1 = __values(fullFilePathList), fullFilePathList_1_1 = fullFilePathList_1.next(); !fullFilePathList_1_1.done; fullFilePathList_1_1 = fullFilePathList_1.next()) {
            var filepath = fullFilePathList_1_1.value;
            promiseArray.push(getFileData(filepath, options));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (fullFilePathList_1_1 && !fullFilePathList_1_1.done && (_a = fullFilePathList_1.return)) _a.call(fullFilePathList_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var cumulativeText = "";
    return new Promise(function (resolve, reject) {
        Promise.all(promiseArray)
            .then(function (values) {
            var e_2, _a;
            try {
                for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                    var val = values_1_1.value;
                    cumulativeText += val.data;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            resolve(cumulativeText);
        })
            .catch(function (error) {
            reject(error);
        });
    });
}
/**
 * Trim out all commented part of a C file
 * @param {string} data
 * @returns string without comments
 */
export function filterComments(data) {
    return data.replace(/\/\/[^\r\n]*/g, '')
        .replace(/\/\*[^*]*\*\//g, '');
}
/**
 * Filter data in accordance to how C preprocessing macros works
 * @param {string} data file content filtered
 * @param {MacroMap} macros an array of C preprocessing macros
 * @returns {FileData} a FileData (custom type)
 */
export function filterMacros(data, macros) {
    var e_3, _a;
    if (macros === void 0) { macros = defaultMacroMap(); }
    var isIncluded = true;
    var hasBeenIncluded = false;
    var filteredData = "";
    var lines = data.split("\n");
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            if (line.includes("#define")) {
                line = line.replace(/.*#define/, '').trim(); //
                var macro = "";
                // does not work well for complex. But well out of my scope
                if (line.match(/^\w+/)) {
                    macro = line.match(/^\w+/)[0];
                }
                var value = line.replace(macro, '').trim() || true;
                if (macro && value) {
                    macros.set(macro, value);
                }
                isIncluded = true;
                continue;
            }
            else if (line.includes('#ifdef')) {
                var flag = line.match(/(?<=#ifdef )\w+/);
                if (flag)
                    isIncluded = macros.has(flag[0]);
                continue;
            }
            else if (line.includes('#ifndef')) {
                var flag = line.match(/(?<=#ifndef )\w+/);
                if (flag) {
                    isIncluded = !macros.has(flag[0]);
                }
                continue;
            }
            else if (line.includes('#if') || line.includes('#elif')) {
                if (hasBeenIncluded) {
                    isIncluded = false;
                    continue;
                }
                // ideally it would be great to support more
                // complex expressions
                line = line.replace(/[()]/g, '');
                var expr = line.match(/((?<=#if )|(?<=#elif )).*/);
                if (!expr) {
                    isIncluded = false;
                    continue;
                }
                var exprTable = expr[0].split(' ');
                if (exprTable.length == 1) {
                    isIncluded = macros.has(exprTable[0]);
                }
                else if (exprTable.length == 2) {
                    console.warn('macro filter failed to interpret : ', exprTable);
                    isIncluded = false;
                }
                else if (exprTable.length == 3) {
                    var first = macros.get(exprTable[0]) || exprTable[0];
                    var second = macros.get(exprTable[2]) || exprTable[2];
                    if (!first || !second) {
                        isIncluded = false;
                        continue;
                    }
                    var operator = exprTable[1];
                    switch (operator) {
                        case "==":
                            isIncluded = (first == second);
                            break;
                        case "!=":
                            isIncluded = (first != second);
                            break;
                        case "<":
                            isIncluded = (+first < +second);
                            break;
                        case "<=":
                            isIncluded = (+first <= +second);
                            break;
                        case ">":
                            isIncluded = (+first > +second);
                            break;
                        case ">=":
                            isIncluded = (+first >= +second);
                            break;
                        case "&&":
                            isIncluded = (first && second) ? true : false;
                            break;
                        case "||":
                            isIncluded = (first || second) ? true : false;
                            break;
                        default:
                            console.warn('macro filter unknown operator :  "' + operator + '"');
                            isIncluded = false;
                    }
                    hasBeenIncluded = isIncluded;
                }
                else {
                    console.warn('macro filter failed to interpret : "' + exprTable.join(' ') + '"');
                    isIncluded = false;
                }
                continue;
            }
            else if (line.includes('#else')) {
                isIncluded = hasBeenIncluded ? false : !isIncluded;
                continue;
            }
            else if (line.includes('#endif')) {
                isIncluded = true;
                hasBeenIncluded = false;
                continue;
            }
            if (isIncluded)
                filteredData += line + '\n'; //maybe i should put the cringe \cr\lf here
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return { data: filteredData, macros: fullyResolveMacro(macros) };
}
function fullyResolveMacro(macros) {
    var e_4, _a;
    try {
        for (var macros_1 = __values(macros), macros_1_1 = macros_1.next(); !macros_1_1.done; macros_1_1 = macros_1.next()) {
            var _b = __read(macros_1_1.value, 2), key = _b[0], value = _b[1];
            if (typeof value !== "string")
                continue;
            // if it's a number it means that it's a raw value, so don't modify it
            if (!isNaN(+value))
                continue;
            // if it's really not a pure value but a reference to another value, lets look for it
            if (macros.has(value)) {
                //has value as a key, we can substitute
                macros.set(key, macros.get(value));
                continue;
            }
            var values = value.split(' ');
            if (values.length === 3) {
                var resolveEach = values.map(function (x) {
                    if (macros.has(x)) {
                        return macros.get(x) + "";
                    }
                    return x;
                });
                var operator = resolveEach[1];
                if (!operator)
                    continue;
                if (operator === "+") {
                    var val1 = resolveEach[0];
                    var val2 = resolveEach[2];
                    if (!val1 || !val2)
                        continue;
                    macros.set(key, (+val1 + +val2) + "");
                }
                else {
                    //console.warn(`fullyResolveMacro: unknown operator : ${operator}`)
                }
            }
        }
    }
    catch (e_4_1) { e_4 = { error: e_4_1 }; }
    finally {
        try {
            if (macros_1_1 && !macros_1_1.done && (_a = macros_1.return)) _a.call(macros_1);
        }
        finally { if (e_4) throw e_4.error; }
    }
    return macros;
}
/**
 * from a folder path "root" (ideally absolute), merge/join a list of relative files
 * @param directory base folder to be considered
 * @param files array of relative path of files
 * @returns an array of absolute path of files, or at least absolute to the folder path
 */
export function autojoinFilePath(directory, files) {
    return files.map(function (file) { return Path.join(directory, file); });
}
/**
 * get a raw files, originally from the Github repository
 * @param path - get
 */
export function getRawFile(path) {
    // i gave god the ugliest fix for the ugliest bug 
    path = path.replace('https:/raw', 'https://raw')
    return new Promise(function (resolved, rejected) {
        fetch(path)
            .then(function (body) {
            body.text()
                .then(function (x) {
                resolved(x);
            })
                .catch(function (e) {
                rejected(e);
            });
        })
            .catch(function (e) {
            rejected(e);
        });
    });
}
