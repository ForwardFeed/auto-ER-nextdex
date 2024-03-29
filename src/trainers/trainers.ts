import { GameData } from "../main";
import { autojoinFilePath, getMulFilesData } from "../utils";
import * as TrainerNames from './names'
//import * as Rematches from './rematches'
import * as TrainersTeam from './teams'



export interface Trainer{
    name: string,
    category: string,
    double: boolean,
    party: TrainersTeam.TrainerPokemon[],
    insane: TrainersTeam.TrainerPokemon[],
    rematches: RematchTrainer[]
}

export interface RematchTrainer{
    double: boolean,
    party: TrainersTeam.TrainerPokemon[]
}

function parse(fileData: string): Map<string, Trainer>{
    const lines = fileData.split('\n')
    const TrainerNamesResult = TrainerNames.parse(lines,0)
    //const RematchesResult = Rematches.parse(lines, TrainerNamesResult.fileIterator)
    const TrainersTeamResult = TrainersTeam.parse(lines, TrainerNamesResult.fileIterator)
    const trainers: Map<string, Trainer> = new Map()
    TrainerNamesResult.trainers.forEach((value, key)=>{
        if (!value) return
        if (!value.NAME){
            for (const remI in value.rematches){
                const rem = value.rematches[remI]
                if (rem && rem.NAME){
                    value = value.rematches.splice(+remI, 1)[0]
                }
            } 
        }
        trainers.set(value.NAME, {
            name: key,
            category: value.category,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: value.rematches
                .filter((x)=> { 
                    if (TrainersTeamResult.trainers.get(x.partyPtr)){
                        return TrainersTeamResult.trainers.get(x.partyPtr).length > 0
                    } else {
                        return false
                    }     
                })
                .map((x)=>{
                    return {
                        double: x.double,
                        party: TrainersTeamResult.trainers.get(x.partyPtr) || []
                    }
                })
        })
    })
    return trainers
}

export function getTrainers(ROOT_PRJ: string, gameData: GameData): Promise<void>{
    return new Promise((resolve: ()=>void, reject)=>{
        const filepaths = autojoinFilePath(ROOT_PRJ, [  'src/data/trainers.h',
                                                        'src/data/trainer_parties.h'])
        getMulFilesData(filepaths, {filterComments: true, filterMacros: true, macros: new Map()})
        .then((fileData)=>{
                gameData.trainers = parse(fileData)
                resolve()
        })
        .catch((reason)=>{
            const err = 'Failed at gettings species reason: ' + reason
            reject(err)
        })
    })
    
}