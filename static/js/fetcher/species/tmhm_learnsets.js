import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        current: [],
        currKey: "",
        tmhmLearnsets: new Map(),
        execFlag: "awaitForData",
        stopRead: false,
    };
}
var executionMap = {
    "awaitForData": function (line, context) {
        if (line.match('gTMHMLearnsets')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[SPECIES_/)) {
            if (context.currKey) {
                context.tmhmLearnsets.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/);
        }
        if (line.match('TMHM')) {
            var tmhm = regexGrabStr(line, /\w+(?=\))/);
            if (tmhm === "0")
                return;
            context.current.push(tmhm);
        }
        else if (line.match('};')) {
            context.tmhmLearnsets.set(context.currKey, context.current);
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
        tmhmLearnsets: context.tmhmLearnsets
    };
}
