import Path from './path-browserify.js';
import { getFileData } from './utils.js';
import * as Moves from './moves.js';
import * as Species from './species/species.js';
import * as Abilities from './abilities.js';
import * as Locations from './locations.js';
import * as Trainers from './trainers/trainers.js';
import * as BattleItems from './battle_items/battle_items.js';
import * as Additionnal from './additional_data/additional.js';
import * as InternalID from './internal_id.js';
import * as Sprites from './sprites.js';
import { compactify } from './compactify.js';
var gameData = {
    species: [],
    abilities: new Map(),
    moves: new Map(),
    locations: {},
    trainers: new Map(),
    mapTable: [],
    battleItems: new Map(),
    speciesInternalID: new Map(),
    spritesPath: new Map(),
};
export function fetchGameData(configuration) {
    return new Promise(function (resolve, reject) {
        var ROOT_PRJ = Path.join(configuration.depot_url, configuration.branch);
        getFileData(Path.join(ROOT_PRJ, 'include/global.h'), { filterComments: true, filterMacros: true, macros: new Map() })
            .then(function (global_h) {
            var optionsGlobal_h = {
                filterComments: true,
                filterMacros: true,
                macros: global_h.macros
            };
            var promiseArray = [];
            promiseArray.push(Species.getSpecies(ROOT_PRJ, optionsGlobal_h, gameData));
            promiseArray.push(Moves.getMoves(ROOT_PRJ, optionsGlobal_h, gameData));
            promiseArray.push(Abilities.getAbilities(ROOT_PRJ, optionsGlobal_h, gameData));
            promiseArray.push(Locations.getLocations(ROOT_PRJ, gameData));
            promiseArray.push(Trainers.getTrainers(ROOT_PRJ, gameData));
            promiseArray.push(BattleItems.getItems(ROOT_PRJ, gameData));
            promiseArray.push(InternalID.getSpeciesInternalID(ROOT_PRJ, gameData));
            promiseArray.push(Sprites.getSprites(ROOT_PRJ, optionsGlobal_h, gameData));
            //promiseArray.push()
            Promise.allSettled(promiseArray)
                .then(function (values) {
                values.map(function (x) {
                    if (x.status !== "fulfilled") {
                        console.error("Something went wrong parsing the data: ".concat(x.reason));
                        return;
                    }
                    var result = x.value;
                    if (typeof result !== "object")
                        return;
                });
                Additionnal.getAdditionnalData(ROOT_PRJ, gameData);
                resolve(compactify(gameData));
            })
                .catch(function (err) {
                console.error("Something went wrong parsing the data: ".concat(err));
                reject(err);
            });
        })
            .catch(function (reason) {
            var err = 'Failed at gettings global.h reason: ' + reason;
            console.error(err);
            reject(err);
        });
    });
}
/*fetchGameData( {
    depot_url: "https://raw.githubusercontent.com/Elite-Redux/eliteredux/",
    branch: "master"
})*/ 
