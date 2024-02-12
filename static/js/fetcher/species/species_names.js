import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        names: new Map(),
        execFlag: "awaitForData",
        stopRead: false,
    };
}
var executionMap = {
    "awaitForData": function (line, context) {
        if (line.match('gSpeciesNames')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[SPECIES_/)) {
            var specieID = regexGrabStr(line, /(?<=^\[)\w+/);
            var name_1 = regexGrabStr(line, /(?<=")[^"]+/);
            context.names.set(specieID, name_1);
        }
        else if (line.match('};')) {
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
        names: context.names
    };
}
