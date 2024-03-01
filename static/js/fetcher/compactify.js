import { Xtox } from "./parse_utils.js";
function initCompactGameData() {
    return {
        abilities: [],
        moves: [],
        species: [],
        locations: {},
        trainers: [],
        typeT: [],
        targetT: [],
        flagsT: [],
        effT: [],
        splitT: [],
        eggT: [],
        growT: [],
        colT: [],
        evoKindT: [],
        items: [],
        natureT: [],
        scriptedEncoutersHowT: [],
        mapsT: []
    };
}
export function compactify(gameData) {
    var compacted = initCompactGameData();
    var tablize = (function (x, table) {
        if (!table.includes(x))
            table.push(x);
        return table.indexOf(x);
    });
    var abiT = [];
    gameData.abilities.forEach(function (val, key) {
        abiT.push(key);
        compacted.abilities.push(val);
    });
    var itemT = [];
    gameData.battleItems.forEach(function (val, key) {
        itemT.push(key);
        compacted.items.push({
            name: val.name,
            NAME: key
        });
    });
    var movesT = [];
    gameData.moves.forEach(function (val, key) {
        movesT.push(key);
        var move = val;
        compacted.moves.push({
            name: move.name,
            NAME: key,
            sName: move.shortName,
            eff: tablize(move.effect, compacted.effT),
            pwr: move.power,
            types: move.types.map(function (x) {
                return tablize(x, compacted.typeT);
            }),
            acc: move.acc,
            pp: move.pp,
            chance: move.chance,
            target: tablize(move.target, compacted.targetT),
            prio: move.priority,
            split: tablize(move.split, compacted.splitT),
            flags: move.flags.map(function (x) {
                return tablize(x, compacted.flagsT);
            }),
            arg: move.argument,
            desc: move.desc,
            lDesc: move.longDesc,
            id: gameData.movesInternalID.get(key)
        });
    });
    var NAMET = [];
    gameData.species.forEach(function (val) {
        NAMET.push(val.NAME);
    });
    var nameT = [];
    compacted.mapsT = gameData.mapTable;
    gameData.species.forEach(function (val) {
        var bs = val.baseStats;
        var sEnc = [];
        compacted.species.push({
            name: (function (x, X) {
                if (nameT.includes(x)) { // because megas are the same names as the non-megas
                    x = Xtox('SPECIES_', X);
                }
                nameT.push(x);
                return x;
            })(val.name, val.NAME),
            NAME: val.NAME,
            stats: {
                base: [bs.baseHP,
                    bs.baseAttack,
                    bs.baseDefense,
                    bs.baseSpAttack,
                    bs.baseSpDefense,
                    bs.baseSpeed,
                ],
                types: bs.types.map(function (x) {
                    return tablize(x, compacted.typeT);
                }),
                catchR: bs.catchRate,
                exp: bs.expYield,
                EVY: [bs.evYield_HP, bs.evYield_Attack, bs.evYield_Defense, bs.evYield_SpAttack, bs.evYield_SpDefense, bs.evYield_Speed],
                items: (function (x) {
                    if (!x.length) {
                        return undefined;
                    }
                    else {
                        return x;
                    }
                })(bs.items),
                gender: bs.genderRatio,
                eggC: bs.eggCycles,
                fren: bs.friendship,
                grow: tablize(bs.growthRate, compacted.growT),
                eggG: bs.eggGroup.map(function (x) {
                    if (!compacted.eggT.includes(x))
                        compacted.eggT.push(x);
                    return compacted.eggT.indexOf(x);
                }),
                abis: bs.abilities.map(function (x) {
                    if (!abiT.includes(x))
                        return 0;
                    return abiT.indexOf(x);
                }),
                inns: bs.innates.map(function (x) {
                    if (!abiT.includes(x))
                        return 0;
                    return abiT.indexOf(x);
                }),
                col: tablize(bs.bodyColor, compacted.colT),
                noFlip: bs.noFlip,
                flags: bs.flags,
            },
            evolutions: val.evolutions.map(function (x) {
                var evo = {};
                if (!compacted.evoKindT.includes(x.kind))
                    compacted.evoKindT.push(x.kind);
                evo.kd = compacted.evoKindT.indexOf(x.kind);
                evo.rs = x.specifier;
                evo.in = NAMET.indexOf(x.into);
                return evo;
            }),
            eggMoves: val.eggMoves.map(function (x) {
                if (!movesT.includes(x))
                    return 0;
                return movesT.indexOf(x);
            }),
            levelUpMoves: val.levelUpMoves.map(function (x) {
                return {
                    id: (function (y) {
                        if (!movesT.includes(y))
                            return 0;
                        return movesT.indexOf(y);
                    })(x.move),
                    lv: x.level
                };
            }),
            TMHMMoves: val.TMHMMoves.map(function (x) {
                x = x.replace(/((TM)|(HM))[^_]+/, 'MOVE');
                if (x === "MOVE_SOLARBEAM")
                    x = "MOVE_SOLAR_BEAM";
                if (!movesT.includes(x)) {
                    console.warn("couldn't figure out ".concat(x, " TMHM move"));
                }
                return movesT.indexOf(x);
            }),
            tutor: val.tutorMoves.map(function (x) {
                if (!movesT.includes(x)) {
                    console.warn("couldn't figure out ".concat(x, " TMHM move"));
                }
                return movesT.indexOf(x);
            }),
            forms: val.forms.map(function (x) {
                return NAMET.indexOf(x);
            }),
            SEnc: sEnc,
            dex: val.dex,
            id: gameData.speciesInternalID.get(val.NAME) || -1,
            sprite: gameData.spritesPath.get(val.NAME)
        });
    });
    compacted.locations = {
        landRate: gameData.locations.landRate,
        waterRate: gameData.locations.waterRate,
        fishRate: gameData.locations.fishRate,
        honeyRate: gameData.locations.honeyRate,
        rockRate: gameData.locations.rockRate,
        hiddenRate: gameData.locations.hiddenRate,
        rodGrade: gameData.locations.rodGrade,
        maps: gameData.locations.maps.map(function (map) {
            return {
                name: map.name,
                land: map.land ? map.land.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                landR: map.landR,
                water: map.water ? map.water.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                waterR: map.waterR,
                fish: map.fish ? map.fish.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                fishR: map.fishR,
                honey: map.honey ? map.honey.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                honeyR: map.honeyR,
                rock: map.rock ? map.rock.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                rockR: map.rockR,
                hidden: map.hidden ? map.hidden.map(function (x) {
                    return [x.min, x.max, NAMET.indexOf(x.specie)];
                }) : undefined,
                hiddenR: map.hiddenR,
            };
        })
    };
    var compactPoke = function (poke) {
        return {
            spc: NAMET.indexOf(poke.specie),
            abi: poke.ability,
            ivs: poke.ivs,
            evs: poke.evs,
            item: tablize(poke.item, itemT),
            nature: (function (nat) {
                nat = Xtox('NATURE_', nat);
                if (!compacted.natureT.includes(nat))
                    compacted.natureT.push(nat);
                return compacted.natureT.indexOf(nat);
            })(poke.nature),
            moves: poke.moves.map(function (mv) {
                return tablize(mv, movesT);
            })
        };
    };
    gameData.trainers.forEach(function (trainer, key) {
        var category = Xtox('TRAINER_CLASS_', trainer.category);
        var mapName;
        if (!trainer.party.length) {
            return;
        }
        compacted.trainers.push({
            name: "".concat(category, " ").concat(trainer.name),
            db: trainer.double,
            party: trainer.party.map(compactPoke),
            insane: trainer.insane.map(compactPoke),
            rem: trainer.rematches.map(function (rem) {
                return {
                    db: rem.double,
                    party: rem.party.map(compactPoke)
                };
            }),
            map: tablize(mapName, compacted.mapsT)
        });
    });
    compacted.trainers = compacted.trainers.sort(function (a, b) {
        if (a.map < b.map) {
            return -1;
        }
        else if (a.map > b.map) {
            return 1;
        }
        return 0;
    });
    return compacted;
}
