import { regexGrabStr } from "./parse_utils.js";
import { getMulFilesData, autojoinFilePath } from "./utils.js";
function initContext() {
    return {
        abilities: new Map(),
        abilitiesPtr: new Map(),
        execFlag: "desc",
        stopRead: false,
    };
}
var executionMap = {
    "desc": function (line, context) {
        if (line.match('u8 s')) {
            var ptr = regexGrabStr(line, /\w+(?=\[)/);
            var desc = regexGrabStr(line, /(?<=")[^"]+/).replace('\\n', ' ');
            context.abilitiesPtr.set(ptr, desc);
        }
        else if (line.match('gAbilityNames')) {
            context.execFlag = "names";
        }
    },
    "names": function (line, context) {
        if (line.match(/\[ABILITY_/)) {
            var abilityID = regexGrabStr(line, /(?<=\[)\w+/);
            var name_1 = regexGrabStr(line, /(?<=")[^"]+/);
            var ability = {
                name: name_1,
                desc: "",
            };
            context.abilities.set(abilityID, ability);
        }
        else if (line.match('};')) {
            context.execFlag = "pointers";
        }
    },
    "pointers": function (line, context) {
        line = line.replace(/\s/g, '');
        if (line.match(/\[ABILITY_/)) {
            var abilityID = regexGrabStr(line, /(?<=\[)\w+/);
            var ability = context.abilities.get(abilityID);
            if (!ability)
                return;
            var ptr = regexGrabStr(line, /(?<==)\w+/);
            var abilityPtrDesc = context.abilitiesPtr.get(ptr);
            if (!abilityPtrDesc)
                return;
            ability.desc = abilityPtrDesc;
            context.abilities.set(abilityID, ability);
        }
        if (line.match('};')) {
            context.stopRead = true;
        }
    }
};
function parse(fileData) {
    var lines = fileData.split('\n');
    var lineLen = lines.length;
    var context = initContext();
    for (var fileIterator = 0; fileIterator < lineLen; fileIterator++) {
        var line = lines[fileIterator];
        executionMap[context.execFlag](line, context);
        if (context.stopRead)
            break;
    }
    return context.abilities;
}
export function getAbilities(ROOT_PRJ, optionsGlobal_h, gameData) {
    return new Promise(function (resolve, reject) {
        getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/text/abilities.h',
        ]), optionsGlobal_h)
            .then(function (abilityData) {
            gameData.abilities = parse(abilityData);
            resolve();
        })
            .catch(function (reason) {
            var err = 'Failed at gettings species reason: ' + reason;
            reject(err);
        });
    });
}
