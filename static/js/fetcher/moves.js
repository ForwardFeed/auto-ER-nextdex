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
import * as Path from './path-browserify.js';
import { regexGrabNum, regexGrabStr, Xtox } from "./parse_utils.js";
import { getFileData, getMulFilesData, autojoinFilePath } from "./utils.js";
var join = Path.join;
function initDescription() {
    return {
        ptrDesc: "",
        desc: "",
    };
}
function initMove() {
    return {
        name: "",
        shortName: "",
        effect: "",
        power: 0,
        types: [],
        acc: 100,
        pp: 0,
        chance: 0,
        target: "",
        priority: 0,
        flags: [],
        split: "",
        argument: "",
        desc: "",
        longDesc: "",
    };
}
function initContext() {
    return {
        stopRead: false,
        execFlag: "",
        stage: stageBattleMovesExecutionMap,
        moves: new Map(),
        currMove: initMove(),
        Descs: new Map(),
        currDesc: initDescription(),
        LongDesc: new Map(),
        currLongDesc: initDescription(),
    };
}
var stageBattleMovesExecutionMap = {
    "": function (line, context) {
        if (line.match('gBattleMoves'))
            context.execFlag = "moves";
    },
    "moves": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[MOVE/)) {
            if (context.currMove.name) {
                if (!context.currMove.types.length)
                    context.currMove.types = ["Normal"]; // default value
                context.moves.set(context.currMove.name, context.currMove);
                context.currMove = initMove();
            }
            context.currMove.name = regexGrabStr(line, /MOVE_\w+/);
        }
        else if (line.match('.effect')) {
            context.currMove.effect = Xtox('EFFECT_', regexGrabStr(line, /EFFECT_\w+/));
        }
        else if (line.match('.power')) {
            context.currMove.power = regexGrabNum(line, /(?<==)\d+/);
        }
        else if (line.match('.type')) {
            context.currMove.types.push(Xtox('TYPE_', regexGrabStr(line, /TYPE_\w+/)));
        }
        else if (line.match('.acc')) {
            context.currMove.acc = regexGrabNum(line, /(?<==)\d+/, 100);
        }
        else if (line.match('.pp')) {
            context.currMove.pp = regexGrabNum(line, /(?<==)\d+/, 0);
        }
        else if (line.match('.secondary')) {
            context.currMove.chance = regexGrabNum(line, /(?<==)\d+/, 0);
        }
        else if (line.match('.target')) {
            context.currMove.target = regexGrabStr(line, /(?<==)\w+/).replace(/^MOVE_TARGET_/, '');
        }
        else if (line.match('.priority')) {
            context.currMove.priority = regexGrabNum(line, /(?<==)[\d-]+/, 0);
        }
        else if (line.match('.flags')) {
            context.currMove.flags = context.currMove.flags.concat(regexGrabStr(line, /(?<==)[^,]+/)
                .split("|")
                .map(function (x) { return Xtox('FLAG_', x); })
                .filter(function (x) { return x !== "0"; }));
        }
        else if (line.match('.split')) {
            context.currMove.split = regexGrabStr(line, /(?<==)\w+/).replace(/^SPLIT_/, '');
        }
        else if (line.match('.argument')) {
            context.currMove.argument = regexGrabStr(line, /(?<==)\w+/);
        }
        else if (line.match(/};/)) {
            if (context.currMove.name) {
                if (!context.currMove.types.length)
                    context.currMove.types = ["Normal"]; // default value
                context.moves.set(context.currMove.name, context.currMove);
            }
            context.stage = stageDescriptionExecutionMap;
            context.execFlag = "desc";
            return;
        }
    }
};
var stageDescriptionExecutionMap = {
    "desc": function (line, context) {
        if (line.match('u8 s')) {
            if (context.currDesc.ptrDesc !== "") {
                context.Descs.set(context.currDesc.ptrDesc, context.currDesc);
                context.currDesc = initDescription();
            }
            context.currDesc.ptrDesc = regexGrabStr(line, /s\w+(?=\[)/);
        }
        else if (line.match('^"')) {
            context.currDesc.desc += regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ');
        }
        else if (line.match(/gMoveDescriptionPointers/)) {
            context.execFlag = "descToMove";
            return;
        }
    },
    "descToMove": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/^\[/)) {
            var moveName = regexGrabStr(line, /(?<=\[)\w+/);
            var descPtr = regexGrabStr(line, /(?<==)\w+/);
            if (!context.moves.has(moveName))
                return;
            var move = context.moves.get(moveName);
            if (!context.Descs.has(descPtr))
                return;
            move.desc = context.Descs.get(descPtr).desc;
            context.moves.set(moveName, move);
        }
        else if (line.match(/};/)) {
            context.execFlag = "descFourLine";
        }
    },
    "descFourLine": function (line, context) {
        if (line.match('u8 s')) {
            if (context.currLongDesc.ptrDesc !== "") {
                context.LongDesc.set(context.currLongDesc.ptrDesc, context.currLongDesc);
                context.currLongDesc = initDescription();
            }
            context.currLongDesc.ptrDesc = regexGrabStr(line, /\w+(?=\[)/);
            context.currLongDesc.desc = regexGrabStr(line, /(?<=")[^"]+/).replace(/\\n/g, ' ');
        }
        else if (line.match('gMoveFourLineDescriptionPointers')) {
            context.execFlag = "descFourLineToMove";
        }
    },
    "descFourLineToMove": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/^\[/)) {
            var moveName = regexGrabStr(line, /(?<=\[)\w+/);
            var descPtr = regexGrabStr(line, /(?<==)\w+/);
            if (!context.moves.has(moveName))
                return;
            var move = context.moves.get(moveName);
            if (!context.LongDesc.has(descPtr))
                return;
            move.longDesc = context.LongDesc.get(descPtr).desc;
            context.moves.set(moveName, move);
        }
        else if (line.match(/};/)) {
            context.stage = stageNameExecutionMap;
            context.execFlag = "";
            return;
        }
    }
};
var stageNameExecutionMap = {
    "": function (line, context) {
        if (line.match(/gMoveNames/))
            context.execFlag = "movesName";
    },
    "movesName": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/^\[/)) {
            var moveName = regexGrabStr(line, /(?<=\[)\w+/);
            var IGName = regexGrabStr(line, /(?<=")[^"]+/);
            if (!context.moves.has(moveName))
                return;
            var move = context.moves.get(moveName);
            move.shortName = IGName;
            context.moves.set(moveName, move);
        }
        else if (line.match(/};/)) {
            context.execFlag = "awaitNamesLong";
            return;
        }
    },
    "awaitNamesLong": function (line, context) {
        if (line.match('gMoveNamesLong')) {
            context.execFlag = "movesNameLong";
            return;
        }
    },
    "movesNameLong": function (line, context) {
        if (line.match(/^\[/)) {
            var moveName = regexGrabStr(line, /(?<=\[)\w+/);
            var IGName = regexGrabStr(line, /(?<=")[^"]+/);
            if (!context.moves.has(moveName))
                return;
            var move = context.moves.get(moveName);
            move.name = IGName;
            context.moves.set(moveName, move);
        }
        else if (line.match(/};/)) {
            context.stopRead = true;
            return;
        }
    }
};
export function parse(filedata) {
    var e_1, _a;
    var lines = filedata.split('\n');
    var context = initContext();
    try {
        for (var lines_1 = __values(lines), lines_1_1 = lines_1.next(); !lines_1_1.done; lines_1_1 = lines_1.next()) {
            var line = lines_1_1.value;
            line = line.trim();
            if (line == "")
                continue;
            context.stage[context.execFlag](line, context);
            if (context.stopRead)
                break;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (lines_1_1 && !lines_1_1.done && (_a = lines_1.return)) _a.call(lines_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return context.moves;
}
export function getMoves(ROOT_PRJ, optionsGlobal_h, gameData) {
    return new Promise(function (resolve, reject) {
        getFileData(join(ROOT_PRJ, 'include/constants/battle_config.h'), optionsGlobal_h)
            .then(function (battle_config) {
            var optionsBattle = {
                filterComments: true,
                filterMacros: true,
                macros: battle_config.macros
            };
            getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/battle_moves.h',
                'src/data/text/move_descriptions.h',
                'src/data/text/move_names.h']), optionsBattle)
                .then(function (movesData) {
                gameData.moves = parse(movesData);
                resolve();
            })
                .catch(reject);
        })
            .catch(reject);
    });
}
