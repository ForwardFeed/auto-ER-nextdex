import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        tutorArray: [],
        current: [],
        currKey: "",
        tutorMoves: new Map(),
        execFlag: "awaitForData",
        stopRead: false,
    };
}
var executionMap = {
    "awaitForData": function (line, context) {
        if (line.match('gTutorLearnsets')) {
            context.execFlag = "newTutor";
        }
    },
    "newTutor": function (line, context) {
        if (line.match('SPECIES_')) {
            if (context.currKey) {
                context.tutorMoves.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /SPECIES_\w+/);
        }
        else if (line.match('MOVE_')) {
            var moveName = regexGrabStr(line, /MOVE_\w+/);
            context.current.push(moveName);
        }
        else if (line.match(';')) {
            if (context.currKey) {
                context.tutorMoves.set(context.currKey, context.current);
            }
            context.stopRead = true;
        }
    },
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
        tutorMoves: context.tutorMoves
    };
}
