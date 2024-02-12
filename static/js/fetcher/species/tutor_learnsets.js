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
        if (line.match('gTutorMoves')) {
            context.execFlag = "setTutorArray";
        }
    },
    "setTutorArray": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match('gNewTutorLearnsets')) {
            context.execFlag = "newTutor";
        }
        else if (line.match('TUTOR_MOVE_')) { // the order is actually important
            var moveName = regexGrabStr(line, /(?<==)\w+/);
            context.tutorArray.push(moveName);
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
        else if (line.match('sTutorLearnsets')) {
            if (context.currKey) {
                context.tutorMoves.set(context.currKey, context.current);
            }
            context.execFlag = "tutorPtr";
        }
    },
    "tutorPtr": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[SPECIES_/)) {
            if (context.currKey) {
                context.tutorMoves.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /(?<=^\[)\w+/);
            if (context.tutorMoves.has(context.currKey)) {
                context.current = context.tutorMoves.get(context.currKey);
            }
            context.current = context.current.concat(regexGrabStr(line, /(?<=\{)[^\}]+/).match(/0x[0-9A-Fa-f]+/g));
        }
        else if (line.match('};')) {
            context.tutorMoves.set(context.currKey, context.current);
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
    /* Now we have to unravel this odd pointer format (yippee)*/
    context.tutorMoves.forEach(function (moves, specie, map) {
        var e_1, _a;
        var tutorNum = 0; //5 in total, [0,1,2,3,4]
        var moveUnraveledArray = [];
        try {
            for (var moves_1 = __values(moves), moves_1_1 = moves_1.next(); !moves_1_1.done; moves_1_1 = moves_1.next()) {
                var move = moves_1_1.value;
                if (isNaN(+move)) {
                    moveUnraveledArray.push(move);
                    continue;
                }
                var moveID = +move;
                for (var i = 0; i < 32; i++) {
                    if (moveID & (1 << i)) {
                        moveUnraveledArray.push(context.tutorArray[i + (tutorNum * 32)]);
                    }
                }
                tutorNum++;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (moves_1_1 && !moves_1_1.done && (_a = moves_1.return)) _a.call(moves_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        map.set(specie, moveUnraveledArray);
    });
    return {
        fileIterator: fileIterator,
        tutorMoves: context.tutorMoves
    };
}
