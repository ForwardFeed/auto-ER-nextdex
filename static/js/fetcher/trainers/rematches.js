import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        rematches: new Map(),
        execFlag: "awaitData",
        stopRead: false
    };
}
var executionMap = {
    "awaitData": function (line, context) {
        if (line.match('RematchTrainer gRematchTable')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        if (line.match('REMATCH')) {
            line = line.replace(/\s/g, '');
            var rematches = regexGrabStr(line, /(?<=REMATCH\()[^)]+/).split(',');
            if (rematches.length) {
                rematches.splice(rematches.length - 1, 1); // remove the map name
                context.rematches.set(rematches.splice(0, 1)[0], rematches);
            }
        }
        if (line.match(';')) {
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
        rematches: context.rematches
    };
}
