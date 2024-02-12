import { regexGrabNum, regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        current: [],
        currKey: "",
        levelUpLearnsetPtr: new Map(),
        levelUpLearnset: new Map(),
        execFlag: "main",
        stopRead: false,
    };
}
var executionMap = {
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (!line)
            return;
        if (line.match('LevelUpMove')) {
            if (context.currKey) {
                context.levelUpLearnsetPtr.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /(?<=LevelUpMove)\w+/);
        }
        else if (line.match('LEVEL_UP_MOVE')) {
            var levelUpMove = {
                level: regexGrabNum(line, /(?<=\()\d+/, 0),
                move: regexGrabStr(line, /\w+(?=\))/)
            };
            context.current.push(levelUpMove);
        }
        if (line.match('gLevelUpLearnsets')) {
            context.levelUpLearnsetPtr.set(context.currKey, context.current);
            context.execFlag = "pointers";
        }
    },
    "pointers": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/^\[SPECIES/)) {
            var species = regexGrabStr(line, /(?<=\[)SPECIES\w+/);
            var ptr = regexGrabStr(line, /(?<==)\w+/);
            if (!context.levelUpLearnsetPtr.has(ptr))
                return;
            var learnset = context.levelUpLearnsetPtr.get(ptr);
            context.levelUpLearnset.set(species, learnset);
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
        levelLearnsets: context.levelUpLearnset
    };
}
