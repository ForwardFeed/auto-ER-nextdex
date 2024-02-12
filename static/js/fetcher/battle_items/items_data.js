import { regexGrabStr } from "../parse_utils.js";
function initItem() {
    return {
        name: "",
        descPtr: "",
    };
}
function initContext() {
    return {
        dataCollection: new Map(),
        currentItem: initItem(),
        key: "",
        isValid: false,
        execFlag: "awaitData",
        stopRead: false
    };
}
var executionMap = {
    "awaitData": function (line, context) {
        if (line.match('gItems')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        var baseLine = line;
        line = line.replace(/\s/g, '');
        if (line.match(/\[ITEM_/)) {
            if (context.isValid && context.key) {
                context.dataCollection.set(context.key, context.currentItem);
            }
            context.currentItem = initItem();
            context.isValid = false;
            context.key = regexGrabStr(line, /(?<=\[)\w+/);
        }
        else if (line.match(/^\.name/)) {
            context.currentItem.name = regexGrabStr(baseLine, /(?<=")[^"]+/);
        }
        else if (line.match(/^\.description/)) {
            context.currentItem.descPtr = regexGrabStr(line, /(?<==)s\w+/);
        }
        else if (line.match(/^\.holdEffect(?==)/)) {
            context.isValid = true; //i only fetch for valid items
        }
        else if (line.match(';')) {
            if (context.isValid && context.key) {
                context.dataCollection.set(context.key, context.currentItem);
            }
            context.stopRead = true;
        }
    }
};
export function parse(lines, fileIterator) {
    var lineLen = lines.length;
    var context = initContext();
    for (; fileIterator < lineLen; fileIterator++) {
        var line = lines[fileIterator];
        executionMap[context.execFlag](line, context);
        if (context.stopRead)
            break;
    }
    return {
        fileIterator: fileIterator,
        data: context.dataCollection
    };
}
