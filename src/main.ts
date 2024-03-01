import * as Path from 'path-browserify'

import {getFileData, getRawFile} from './utils';
import * as Moves from './moves'
import * as Species from './species/species'
import * as Abilities from './abilities'
import * as Locations from './locations'
import * as Trainers from './trainers/trainers'
import * as BattleItems from './battle_items/battle_items'
import * as Additionnal from './additional_data/additional'
import * as InternalID from './internal_id'
import * as Sprites from './sprites'
import { CompactGameData, compactify } from './compactify';


interface Configuration{
    depot_url: string,
    branch: string,
}

export interface GameData {
    species: Species.Specie[]
    abilities: Map<string, Abilities.Ability>
    moves:Map<string, Moves.Move>,
    locations: Locations.Locations
    trainers: Map<string, Trainers.Trainer>
    mapTable: string[], 
    battleItems: Map<string, BattleItems.BattleItem>
    speciesInternalID: Map<string, number>,
    movesInternalID: Map<string, number>,
    spritesPath: Map<string, string>
}

const gameData: GameData = {
    species: [] as Species.Specie[],
    abilities: new Map(),
    moves: new Map(),
    locations: {} as Locations.Locations,
    trainers: new Map(),
    mapTable: [],
    battleItems: new Map(),
    speciesInternalID: new Map(),
    movesInternalID: new Map(),
    spritesPath: new Map(),
}

export function fetchGameData(configuration: Configuration): Promise<CompactGameData>{
    return new Promise((resolve, reject)=>{
        const ROOT_PRJ = Path.join(configuration.depot_url, configuration.branch)
        getFileData(Path.join(ROOT_PRJ, 'include/global.h'), {filterComments: true, filterMacros: true, macros: new Map()})
        .then((global_h) => {
            const optionsGlobal_h = {
                filterComments: true,
                filterMacros: true,
                macros: global_h.macros
            }
            const promiseArray: Array<Promise<unknown>> = []
            promiseArray.push(Species.getSpecies(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Moves.getMoves(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Abilities.getAbilities(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(Locations.getLocations(ROOT_PRJ, gameData))
            promiseArray.push(Trainers.getTrainers(ROOT_PRJ, gameData))
            promiseArray.push(BattleItems.getItems(ROOT_PRJ, gameData))
            promiseArray.push(InternalID.getSpeciesInternalID(ROOT_PRJ, gameData))
            promiseArray.push(Sprites.getSprites(ROOT_PRJ, optionsGlobal_h, gameData))
            promiseArray.push(InternalID.getMovesInternalID(ROOT_PRJ, gameData))
            //promiseArray.push()
            Promise.allSettled(promiseArray)
                .then((values)=>{
                    values.map((x)=>{
                        if (x.status !== "fulfilled") {
                            console.error(`Something went wrong parsing the data: ${x.reason}`)
                            return
                        }
                        const result = x.value
                        if (typeof result !== "object") return

                    })
                    Additionnal.getAdditionnalData(ROOT_PRJ, gameData)
                    resolve(compactify(gameData))
                })
                .catch((err)=>{
                    console.error(`Something went wrong parsing the data: ${err}`)
                    reject(err)
                })
            
        })
        .catch((reason) => {
            const err = 'Failed at gettings global.h reason: ' + reason
            console.error(err)
            reject(err)
        })
    })
    
}

/*fetchGameData( {
    depot_url: "https://raw.githubusercontent.com/Elite-Redux/eliteredux/",
    branch: "master"
})*/