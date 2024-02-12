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
import Path from './path-browserify.js';
import { getRawFile } from './utils.js';
import { Xtox } from './parse_utils.js';
function parse(data) {
    var e_1, _a, _b, e_2, _c, e_3, _d, _e, e_4, _f, _g;
    var obj = JSON.parse(data);
    var locations = {};
    var locationsFieldJSON = obj.wild_encounter_groups[0].fields;
    var xmapMap = {
        "land_mons": "land",
        "water_mons": "water",
        "rock_smash_mons": "rock",
        "fishing_mons": "fish",
        "honey_mons": "honey",
        "hidden_mons": "hidden"
    };
    try {
        for (var locationsFieldJSON_1 = __values(locationsFieldJSON), locationsFieldJSON_1_1 = locationsFieldJSON_1.next(); !locationsFieldJSON_1_1.done; locationsFieldJSON_1_1 = locationsFieldJSON_1.next()) {
            var field = locationsFieldJSON_1_1.value;
            var JSONF = field.type;
            var F = xmapMap[JSONF] + "Rate";
            Object.assign(locations, (_b = {}, _b[F] = field.encounter_rates || -1, _b));
            if (JSONF === "fishing_mons") {
                var group = field.groups;
                locations.rodGrade = [
                    group.old_rod[group.old_rod.length - 1],
                    group.good_rod[group.good_rod.length - 1],
                    group.super_rod[group.super_rod.length - 1],
                ];
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (locationsFieldJSON_1_1 && !locationsFieldJSON_1_1.done && (_a = locationsFieldJSON_1.return)) _a.call(locationsFieldJSON_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    var xmapFields = [
        ["land_mons", "land"],
        ["water_mons", "water"],
        ["rock_smash_mons", "rock"],
        ["fishing_mons", "fish"],
        ["honey_mons", "honey"],
        ["hidden_mons", "hidden"]
    ];
    var locationsEncountersJSON = obj.wild_encounter_groups[0].encounters.concat(obj.wild_encounter_groups[3].encounters);
    var maps = [];
    try {
        for (var locationsEncountersJSON_1 = __values(locationsEncountersJSON), locationsEncountersJSON_1_1 = locationsEncountersJSON_1.next(); !locationsEncountersJSON_1_1.done; locationsEncountersJSON_1_1 = locationsEncountersJSON_1.next()) {
            var locationJSON = locationsEncountersJSON_1_1.value;
            var location_1 = {};
            if (locationJSON.map) {
                location_1.name = Xtox('MAP_', locationJSON.map);
            }
            else {
                location_1.name = locationJSON.base_label.replace('gBerry', 'Tree ');
            }
            try {
                for (var xmapFields_1 = (e_3 = void 0, __values(xmapFields)), xmapFields_1_1 = xmapFields_1.next(); !xmapFields_1_1.done; xmapFields_1_1 = xmapFields_1.next()) {
                    var field = xmapFields_1_1.value;
                    var JSONF = field[0];
                    var F = field[1];
                    var FR = F + "R";
                    if (locationJSON[JSONF]) {
                        Object.assign(location_1, (_e = {}, _e[FR] = locationJSON[JSONF].encounter_rate || -1, _e));
                        var listEncounters = [];
                        try {
                            for (var _h = (e_4 = void 0, __values(locationJSON[JSONF].mons)), _j = _h.next(); !_j.done; _j = _h.next()) {
                                var mon = _j.value;
                                listEncounters.push({
                                    specie: mon.species || "SPECIES_NONE",
                                    min: mon.min_level || 1,
                                    max: mon.max_level || 100,
                                });
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_j && !_j.done && (_f = _h.return)) _f.call(_h);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                        Object.assign(location_1, (_g = {}, _g[F] = listEncounters, _g));
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (xmapFields_1_1 && !xmapFields_1_1.done && (_d = xmapFields_1.return)) _d.call(xmapFields_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            maps.push(location_1);
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (locationsEncountersJSON_1_1 && !locationsEncountersJSON_1_1.done && (_c = locationsEncountersJSON_1.return)) _c.call(locationsEncountersJSON_1);
        }
        finally { if (e_2) throw e_2.error; }
    }
    locations.maps = maps;
    return locations;
}
export function getLocations(ROOT_PRJ, gameData) {
    return new Promise(function (resolve, reject) {
        // include 'src/data/region_map/region_map_entries.h' ?
        var filepath = Path.join(ROOT_PRJ, 'src/data/wild_encounters.json');
        getRawFile(filepath)
            .then(function (data) {
            gameData.locations = parse(data);
            resolve();
        })
            .catch(function () {
            reject("Error trying to read ".concat(filepath));
        });
    });
}
