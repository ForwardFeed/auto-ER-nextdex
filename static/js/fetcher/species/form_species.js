import { regexGrabStr } from "../parse_utils.js";
function initContext() {
    return {
        current: [],
        currKey: "",
        forms: new Map(),
        execFlag: "main",
        stopRead: false,
    };
}
var executionMap = {
    "main": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match('u16s')) {
            if (context.currKey) {
                context.forms.set(context.currKey, context.current);
                context.current = [];
            }
            context.currKey = regexGrabStr(line, /(?<=constu16)\w+/);
        }
        else if (line.match('SPECIES_')) {
            // apparently /(?<=[^_])SPECIES_\w+/ doesn't work so f u
            var value = regexGrabStr(line, /SPECIES_\w+/);
            if (value === "SPECIES_END")
                return;
            if (value === context.currKey)
                return;
            context.current.push(value);
        }
        else if (line.match('gFormSpeciesIdTables')) {
            context.execFlag = "pointers";
        }
    },
    "pointers": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[SPECIES_/)) {
            var species = regexGrabStr(line, /(?<=\[)SPECIES\w+/);
            var ptr = regexGrabStr(line, /(?<==)\w+/);
            if (!context.forms.has(ptr))
                return;
            var formList = context.forms.get(ptr);
            if (!formList)
                return;
            context.forms.set(species, formList);
            context.forms.delete(ptr);
        }
        else if (line.match('};')) {
            context.forms.set(context.currKey, context.current);
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
        forms: context.forms
    };
}
