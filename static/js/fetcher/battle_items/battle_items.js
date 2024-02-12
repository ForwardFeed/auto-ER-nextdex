import { getMulFilesData, autojoinFilePath } from '../utils.js';
import * as ItemData from './items_data.js';
import * as ItemDesc from './items_descriptions.js';
function parse(pokeData) {
    var lines = pokeData.split('\n');
    var itemDataResult = ItemData.parse(lines, 0);
    var itemDescResult = ItemDesc.parse(lines, itemDataResult.fileIterator);
    var items = new Map();
    itemDataResult.data.forEach(function (item, key) {
        items.set(key, {
            name: item.name,
            desc: itemDescResult.data.get(item.descPtr) || "No description?"
        });
    });
    return items;
}
export function getItems(ROOT_PRJ, gameData) {
    return new Promise(function (resolve, reject) {
        getMulFilesData(autojoinFilePath(ROOT_PRJ, [
            'src/data/items.h',
            'src/data/text/item_descriptions.h',
        ])).then(function (itemsData) {
            gameData.battleItems = parse(itemsData);
            resolve();
        })
            .catch(function (reason) {
            var err = 'Failed at gettings species reason: ' + reason;
            reject(err);
        });
    });
}
