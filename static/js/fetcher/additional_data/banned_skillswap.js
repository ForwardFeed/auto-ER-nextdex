import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        dataCollection: [],
        execFlag: "awaitData",
        stopRead: false
    };
}
var executionMap = {
    "awaitData": function (line, context) {
        if (line.match('u16 sSkillSwapBannedAbilities')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        if (line.match('ABILITY_')) {
            context.dataCollection.push(regexGrabStr(line, /ABILITY_\w+/));
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
