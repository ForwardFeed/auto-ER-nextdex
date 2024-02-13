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
