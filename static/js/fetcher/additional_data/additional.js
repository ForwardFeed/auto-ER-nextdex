var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
import * as SkillSwap from './banned_skillswap.js';
import * as RolePlay from './banned_roleplay.js';
import * as WorrySeed from './banned_worry_seed.js';
import * as GastroAcid from './banned_gastro_acid.js';
import * as Entrainement from './banned_entrainment.js';
import { getFileData } from '../utils.js';
import * as Path from '../path-browserify.js';
var join = Path.join;
export function parse(fileData) {
    var lines = fileData.split('\n');
    var SkillSwapResult = SkillSwap.parse(lines, 0);
    var RolePlayResult = RolePlay.parse(lines, SkillSwapResult.fileIterator);
    var WorrySeedResult = WorrySeed.parse(lines, RolePlayResult.fileIterator);
    var GastroAcidResult = GastroAcid.parse(lines, WorrySeedResult.fileIterator);
    var EntrainementResult = Entrainement.parse(lines, GastroAcidResult.fileIterator);
    return {
        banSkillSwap: SkillSwapResult.data,
        banRoleplay: RolePlayResult.data,
        banWorrySeed: WorrySeedResult.data,
        banGastroAcid: GastroAcidResult.data,
        banEntrainement: EntrainementResult.data,
    };
}
function replaceWithName(data, abilities) {
    var e_1, _a, e_2, _b;
    var keys = Object.keys(data);
    try {
        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
            var key = keys_1_1.value;
            var fields = data[key];
            var newField = [];
            try {
                for (var fields_1 = (e_2 = void 0, __values(fields)), fields_1_1 = fields_1.next(); !fields_1_1.done; fields_1_1 = fields_1.next()) {
                    var ability = fields_1_1.value;
                    if (abilities.has(ability)) {
                        newField.push(abilities.get(ability).name);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (fields_1_1 && !fields_1_1.done && (_b = fields_1.return)) _b.call(fields_1);
                }
                finally { if (e_2) throw e_2.error; }
            }
            data[key] = newField;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return data;
}
export function getAdditionnalData(ROOT_PRJ, gameData) {
    return new Promise(function (resolved, rejected) {
        getFileData(join(ROOT_PRJ, 'src/battle_util.c'), { filterComments: true, filterMacros: true, macros: new Map() })
            .then(function (filedata) {
            var data = replaceWithName(parse(filedata.data), gameData.abilities);
            var dataTowrite = JSON.stringify(data);
            //TODO GET THIS DATA OUT OF THERE
        })
            .catch(function (x) {
            rejected(x);
        });
    });
}
