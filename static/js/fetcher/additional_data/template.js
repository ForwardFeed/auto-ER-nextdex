function initContext() {
    return {
        dataCollection: [],
        execFlag: "awaitData",
        stopRead: false
    };
}
var executionMap = {
    "awaitData": function (line, context) {
        if (line.match('trigger')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        if (line.match('data detected')) {
        }
        if (line.match('};')) {
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
