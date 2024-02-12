import { autojoinFilePath, getMulFilesData } from "../utils.js";
import * as TrainerNames from './names.js';
//import * as Rematches from './rematches'
import * as TrainersTeam from './teams.js';
function parse(fileData) {
    var lines = fileData.split('\n');
    var TrainerNamesResult = TrainerNames.parse(lines, 0);
    //const RematchesResult = Rematches.parse(lines, TrainerNamesResult.fileIterator)
    var TrainersTeamResult = TrainersTeam.parse(lines, TrainerNamesResult.fileIterator);
    // put all rematches right
    var rematchIntegratedTrainers = new Map();
    var trainers = new Map();
    TrainerNamesResult.trainers.forEach(function (value, key) {
        trainers.set(value.NAME, {
            name: key,
            category: value.category,
            double: value.double,
            party: TrainersTeamResult.trainers.get(value.partyPtr) || [],
            insane: TrainersTeamResult.trainers.get(value.insanePtr) || [],
            rematches: value.rematches
                .filter(function (x) {
                if (TrainersTeamResult.trainers.get(x.partyPtr)) {
                    return TrainersTeamResult.trainers.get(x.partyPtr).length > 0;
                }
                else {
                    return false;
                }
            })
                .map(function (x) {
                return {
                    double: x.double,
                    party: TrainersTeamResult.trainers.get(x.partyPtr) || []
                };
            })
        });
    });
    return trainers;
}
export function getTrainers(ROOT_PRJ, gameData) {
    return new Promise(function (resolve, reject) {
        var filepaths = autojoinFilePath(ROOT_PRJ, ['src/data/trainers.h',
            'src/data/trainer_parties.h']);
        getMulFilesData(filepaths, { filterComments: true, filterMacros: true, macros: new Map() })
            .then(function (fileData) {
            gameData.trainers = parse(fileData);
            resolve();
        })
            .catch(function (reason) {
            var err = 'Failed at gettings species reason: ' + reason;
            reject(err);
        });
    });
}
