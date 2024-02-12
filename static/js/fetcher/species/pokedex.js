import { regexGrabNum, regexGrabStr } from "../parse_utils.js";
function initPokePokedex() {
    return {
        id: -1,
        desc: "",
        hw: [0, 0]
    };
}
function initContext() {
    return {
        dataCollection: new Map(),
        descMap: new Map(),
        dexID: 0,
        current: initPokePokedex(),
        currentKey: "",
        execFlag: "desc",
        stopRead: false
    };
}
var executionMap = {
    "desc": function (line, context) {
        if (line.match(/PokedexText\[\]/)) {
            context.currentKey = regexGrabStr(line, /\w+(?=\[)/);
        }
        else if (line.match('"')) {
            var desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ');
            if (context.descMap.has(context.currentKey)) {
                var prev = context.descMap.get(context.currentKey) + desc;
                context.descMap.set(context.currentKey, prev);
            }
            else {
                context.descMap.set(context.currentKey, desc);
            }
        }
        else if (line.match("gPokedexEntries")) {
            context.currentKey = "";
            context.execFlag = "entries";
        }
    },
    "entries": function (line, context) {
        if (line.match('NATIONAL_DEX')) {
            if (context.currentKey) {
                context.dataCollection.set(context.currentKey, context.current);
                context.current = initPokePokedex();
            }
            context.currentKey = regexGrabStr(line, /(?<=\[)\w+(?=\])/).replace('NATIONAL_DEX', 'SPECIES');
            context.current.id = context.dexID;
            context.dexID++;
        }
        else if (line.match('.height')) {
            context.current.hw[0] = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/);
        }
        else if (line.match('.weight')) {
            context.current.hw[1] = regexGrabNum(line.replace(/\s/g, ''), /(?<==)\d+/);
        }
        else if (line.match('.description')) {
            var descPtr = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/);
            context.current.desc = context.descMap.get(descPtr).replace(/--/g, '  ') || "";
        }
        else if (line.match(';')) {
            if (context.currentKey) {
                context.dataCollection.set(context.currentKey, context.current);
                context.current = initPokePokedex();
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
