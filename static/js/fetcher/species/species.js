import * as SpeciesNames from './species_names.js';
import * as BaseStats from './base_stats.js';
import * as Evolutions from './evolutions.js';
import * as EggMoves from './egg_moves.js';
import * as LevelUpLearnSets from './level_up_learnsets.js';
import * as TMHMLearnsets from './tmhm_learnsets.js';
import * as TutorMoves from './tutor_learnsets.js';
import * as FormsSpecies from './form_species.js';
import * as PokePokedex from './pokedex.js';
import { getMulFilesData, autojoinFilePath } from '../utils.js';
function parse(pokeData) {
    var lines = pokeData.split('\n');
    var pokePokedexResult = PokePokedex.parse(lines, 0);
    var speciesNamesResult = SpeciesNames.parse(lines, pokePokedexResult.fileIterator);
    var baseStatsResult = BaseStats.parse(lines, speciesNamesResult.fileIterator);
    var evolutionsResult = Evolutions.parse(lines, baseStatsResult.fileIterator);
    var eggMovesResult = EggMoves.parse(lines, evolutionsResult.fileIterator);
    var levelUpLearnsetsResult = LevelUpLearnSets.parse(lines, eggMovesResult.fileIterator);
    var TMHMLearnsetsResult = TMHMLearnsets.parse(lines, levelUpLearnsetsResult.fileIterator);
    var TutorMovesResult = TutorMoves.parse(lines, TMHMLearnsetsResult.fileIterator);
    var formsResult = FormsSpecies.parse(lines, TutorMovesResult.fileIterator);
    var species = [];
    baseStatsResult.baseStats.forEach(function (BaseStats, key) {
        species.push({
            NAME: key,
            name: speciesNamesResult.names.get(key) || "undefined",
            baseStats: BaseStats,
            evolutions: evolutionsResult.evolutions.get(key) || [],
            eggMoves: eggMovesResult.eggMoves.get(key) || [],
            levelUpMoves: levelUpLearnsetsResult.levelLearnsets.get(key) || [],
            TMHMMoves: TMHMLearnsetsResult.tmhmLearnsets.get(key) || [],
            tutorMoves: TutorMovesResult.tutorMoves.get(key) || [],
            forms: formsResult.forms.get(key) || [],
            dex: pokePokedexResult.data.get(key) || {}
        });
    });
    return species;
}
export function getSpecies(ROOT_PRJ, optionsGlobal_h, gameData) {
    return new Promise(function (resolve, reject) {
        getMulFilesData(autojoinFilePath(ROOT_PRJ, [
            'src/data/pokemon/pokedex_text.h', //both goes together with entries
            'src/data/pokemon/pokedex_entries.h',
            'src/data/text/species_names.h',
            'src/data/pokemon/base_stats.h',
            'src/data/pokemon/evolution.h',
            'src/data/pokemon/egg_moves.h',
            'src/data/pokemon/level_up_learnsets.h', // order with pointers is important
            'src/data/pokemon/level_up_learnset_pointers.h',
            'src/data/pokemon/tmhm_learnsets.h',
            'src/data/pokemon/tutor_learnsets.h',
            'src/data/pokemon/form_species_tables.h',
            'src/data/pokemon/form_species_table_pointers.h',
            'src/data/graphics/pokemon.h',
            'src/data/pokemon_graphics/front_pic_table.h',
        ]), optionsGlobal_h)
            .then(function (pokeData) {
            gameData.species = parse(pokeData);
            resolve();
        })
            .catch(function (reason) {
            var err = 'Failed at gettings species reason: ' + reason;
            reject(err);
        });
    });
}
