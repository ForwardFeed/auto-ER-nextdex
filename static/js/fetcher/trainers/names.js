import { regexGrabNum, regexGrabStr } from "../parse_utils.js";
import { Xtox } from "../parse_utils.js";
function initBaseTrainer() {
    return {
        NAME: "",
        category: "",
        double: false,
        partyPtr: "",
        insanePtr: "",
        rematches: new Array(5), //MAX_REMATCH NUMBER
    };
}
function initContext() {
    return {
        current: initBaseTrainer(),
        key: "",
        trainers: new Map(),
        execFlag: "main",
        stopRead: false
    };
}
var executionMap = {
    "main": function (line, context) {
        if (line.match(/\[TRAINER_/)) {
            if (context.key) {
                context.current.NAME = context.key;
                // now we need to integrate the rematches in function of the id
                var trainerNumber = regexGrabNum(context.key, /(?<=_)\d+$/, 0);
                context.key = Xtox('TRAINER_', context.key.replace(/_\d+$/g, ''));
                if (!context.key.includes('Grunt') || !trainerNumber) { //grunt are an exception
                    if (trainerNumber && trainerNumber != 1) {
                        if (context.trainers.has(context.key)) {
                            //if a trainer is already in place it means that we're in a rematch context
                            var preExistingTrainer = context.trainers.get(context.key);
                            if (!preExistingTrainer)
                                return;
                            preExistingTrainer.rematches[trainerNumber] = context.current;
                            context.trainers.set(context.key, preExistingTrainer);
                        }
                        else {
                            //eventually the base trainer will arrive after, 
                            //if he does not welp gonna check this at the end of the parsing
                            var placeHolderBaseTrainer = initBaseTrainer();
                            placeHolderBaseTrainer.rematches[trainerNumber] = context.current;
                            context.trainers.set(context.key, placeHolderBaseTrainer);
                        }
                    }
                    else {
                        if (context.trainers.has(context.key)) {
                            var preExistingTrainer = context.trainers.get(context.key);
                            context.current.rematches = (preExistingTrainer === null || preExistingTrainer === void 0 ? void 0 : preExistingTrainer.rematches) || [];
                        }
                        context.trainers.set(context.key, context.current);
                    }
                }
                else {
                    context.trainers.set(context.key + " " + trainerNumber, context.current);
                }
                context.current = initBaseTrainer();
            }
            context.key = regexGrabStr(line, /TRAINER_\w+/);
        }
        else if (line.match('trainerClass')) {
            context.current.category = regexGrabStr(line, /TRAINER_CLASS_\w+/);
        }
        else if (line.match('doubleBattle')) {
            context.current.double = regexGrabStr(line.replace(/\s/g, ''), /(?<==)\w+/) === "TRUE" ? true : false;
        }
        else if (line.match('partySizeInsane')) { //order is important with partysize
            context.current.insanePtr = regexGrabStr(line, /sParty_\w+/);
        }
        else if (line.match('partySize')) {
            context.current.partyPtr = regexGrabStr(line, /sParty_\w+/);
        }
        else if (line.match('};')) {
            if (context.key) {
                context.trainers.set(context.key, context.current);
            }
            context.stopRead = true;
        }
    }
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
        trainers: context.trainers
    };
}
