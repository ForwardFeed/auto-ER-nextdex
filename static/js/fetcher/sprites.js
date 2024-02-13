import { regexGrabStr } from "./parse_utils.js";
import { getMulFilesData, autojoinFilePath } from "./utils.js";
function initContext() {
    return {
        sprites: new Map(),
        spritesPtr: new Map(),
        execFlag: "ptr",
        stopRead: false,
    };
}
var executionMap = {
    "ptr": function (line, context) {
        if (line.match('u32 gMonFrontPic')) {
            var ptr = regexGrabStr(line, /\w+(?=\[)/);
            var path = regexGrabStr(line, /(?<=")[^"]+/).replace(/[^/]+lz/, 'front.png').replace('graphics/pokemon/', '');
            context.spritesPtr.set(ptr, path);
        }
        else if (line.match('gMonFrontPicTable')) {
            context.execFlag = "species";
        }
    },
    "species": function (line, context) {
        if (line.match(/SPECIES_/)) {
            var specie = "SPECIES_" + regexGrabStr(line, /(?<=\()\w+/);
            var ptr = regexGrabStr(line, /gMonFrontPic\w+/);
            if (!context.spritesPtr.has(ptr))
                return;
            var path = context.spritesPtr.get(ptr);
            context.sprites.set(specie, path);
        }
        else if (line.match('};')) {
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
        spritesPath: context.sprites
    };
}
export function getSprites(ROOT_PRJ, optionsGlobal_h, gameData) {
    return new Promise(function (resolve, reject) {
        getMulFilesData(autojoinFilePath(ROOT_PRJ, ['src/data/graphics/pokemon.h',
            'src/data/pokemon_graphics/front_pic_table.h',
        ]), optionsGlobal_h)
            .then(function (spriteData) {
            var lines = spriteData.split('\n');
            var spriteResult = parse(lines, 0);
            gameData.spritesPath = spriteResult.spritesPath;
            resolve(null);
        })
            .catch(function (reason) {
            var err = 'Failed at gettings species reason: ' + reason;
            reject(err);
        });
    });
}
