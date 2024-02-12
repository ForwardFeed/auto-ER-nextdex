import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        current: [],
        currKey: "",
        eggMoves: new Map(),
        execFlag: "awaitForStart",
        stopRead: false,
    };
}
var executionMap = {
    "awaitForStart": function (line, context) {
        if (line.match('gEggMoves')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (!line)
            return;
        if (line.match('egg_moves')) {
            if (context.currKey) {
                context.eggMoves.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = "SPECIES_" + regexGrabStr(line, /(?<=\()\w+/);
        }
        if (line.match(/MOVE/)) {
            context.current.push(regexGrabStr(line, /MOVE\w+/));
        }
        else if (line.match('};')) {
            context.eggMoves.set(context.currKey, context.current);
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
        eggMoves: context.eggMoves
    };
}
