import { regexGrabStr } from "../parse_utils.js";
function initEvolution() {
    return {
        kind: "",
        specifier: "",
        into: "",
    };
}
function initContext() {
    return {
        current: [],
        currKey: "",
        evolutions: new Map(),
        execFlag: "awaitForStart",
        stopRead: false,
    };
}
var executionMap = {
    "awaitForStart": function (line, context) {
        if (line.match('gEvolutionTable')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (!line)
            return;
        if (line.match(/^\[SPECIES/)) {
            if (context.currKey) {
                context.evolutions.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/);
        }
        if (line.match(/(?<={)EVO/)) {
            var values = regexGrabStr(line, /(?<={)EVO[\w,]+/).split(',');
            context.current.push({
                kind: values[0],
                specifier: values[1],
                into: values[2],
            });
        }
        else if (line.match('};')) {
            context.evolutions.set(context.currKey, context.current);
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
        evolutions: context.evolutions
    };
}
