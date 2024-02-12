import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        dataCollection: new Map(),
        key: "",
        currentDesc: "",
        execFlag: "main",
        stopRead: false
    };
}
var executionMap = {
    "main": function (line, context) {
        if (line.match('static const u8')) {
            if (context.key) {
                context.dataCollection.set(context.key, context.currentDesc);
            }
            context.key = regexGrabStr(line, /s\w+(?=\[)/);
            context.currentDesc = "";
        }
        else if (line.match('"')) {
            var desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ');
            context.currentDesc += desc;
        } // no stop read because it is read last
    }
};
export function parse(lines, fileIterator) {
    var lineLen = lines.length;
    var context = initContext();
    for (; fileIterator < lineLen; fileIterator++) {
        var line = lines[fileIterator];
        executionMap[context.execFlag](line, context);
        if (context.stopRead) {
            fileIterator--;
            break;
        }
    }
    //since there is no stop it will continue read and won't read the last one
    if (context.key) {
        context.dataCollection.set(context.key, context.currentDesc);
    }
    return {
        fileIterator: fileIterator,
        data: context.dataCollection
    };
}
