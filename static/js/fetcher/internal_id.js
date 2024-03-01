import Path from './path-browserify.js';
import { getFileData } from './utils.js';
var join = Path.join;
export function getSpeciesInternalID(ROOT_PRJ, gamedata) {
    return new Promise(function (resolved, rejected) {
        getFileData(join(ROOT_PRJ, 'include/constants/species.h'), { filterComments: true, filterMacros: true, macros: new Map() })
            .then(function (filedata) {
            var internalIDSpecies = new Map();
            filedata.macros.forEach(function (val, key) {
                if (key.match('SPECIES_')) {
                    internalIDSpecies.set(key, +val);
                }
            });
            gamedata.speciesInternalID = internalIDSpecies;
            resolved();
        })
            .catch(function (e) {
            rejected(e);
        });
    });
}
export function getMovesInternalID(ROOT_PRJ, gamedata) {
    return new Promise(function (resolved, rejected) {
        getFileData(join(ROOT_PRJ, 'include/constants/moves.h'), { filterComments: true, filterMacros: true, macros: new Map() })
            .then(function (filedata) {
            var internalIDMoves = new Map();
            filedata.macros.forEach(function (val, key) {
                if (key.match('MOVE_')) {
                    internalIDMoves.set(key, +val);
                }
            });
            gamedata.movesInternalID = internalIDMoves;
            resolved();
        })
            .catch(function (e) {
            rejected(e);
        });
    });
}
