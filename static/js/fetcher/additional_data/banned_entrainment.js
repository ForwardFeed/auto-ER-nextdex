import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        dataCollection: [],
        execFlag: "awaitFirst",
        stopRead: false
    };
}
var executionMap = {
    "awaitFirst": function (line, context) {
        if (line.match('u16 sEntrainmentBannedAttackerAbilities')) {
            context.execFlag = "First";
        }
    },
    "First": function (line, context) {
        if (line.match('ABILITY_')) {
            context.dataCollection.push(regexGrabStr(line, /ABILITY_\w+/));
        }
        if (line.match(';')) {
            context.execFlag = "awaitSecond";
        }
    },
    "awaitSecond": function (line, context) {
        if (line.match('u16 sEntrainmentTargetSimpleBeamBannedAbilities')) {
            context.execFlag = "Second";
        }
    },
    "Second": function (line, context) {
        if (line.match('ABILITY_')) {
            var abi = regexGrabStr(line, /ABILITY_\w+/);
            if (!context.dataCollection.includes(abi))
                context.dataCollection.push(abi);
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
        data: context.dataCollection
    };
}
