import { updateSpecies } from "./species_panel.js"
import { updateAbilities} from "./abilities_panel.js"
import { updateMoves } from "./moves_panel.js"
import { updateLocations } from "./locations_panel.js"
import { updateTrainers } from "./trainers_panel.js"

export const search = {
    // the search guard is here to prevent that while the app is searching
    // no more searching is going, not to overwhelm the app
    updateGuard: false,
    // if a request is done in the mean time, this flag will tell that once it's finished,
    // another request should be scheduled
    updateQueue: false,
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelUpdatesTable: [
        updateSpecies,
        updateAbilities,
        updateMoves,
        updateLocations,
        updateTrainers,
    ],
    // 
    // if modified sync it with "siderbar.js > setupPanels() > panelTable" variable
    panelFrozenUpdate: [
        false,
        false,
        false,
        false,
        false,
    ],
    // if modified sync it with "siderbar.js > setupPanels() > defaultShow" variable
    panelUpdatesIndex: 0 
}

export function setupSearch(){
    $('#main-search').on('keyup', function(){
        $(this).val($(this).val().toLowerCase())
        const searchValue = $(this).val()
        if (search.updateGuard) {
            search.updateQueue = true
            return
        }
        search.updateGuard = true
        while(true){
            fastdom.mutate(() => {
                //tells all panels that once they get to switch in they have to do an update
                search.panelFrozenUpdate = search.panelFrozenUpdate.map((x, index)=>{
                    return search.panelUpdatesIndex != index
                })
                //execute the update of the active panel
                search.panelUpdatesTable[search.panelUpdatesIndex](searchValue)
            })
            if (!search.updateQueue) break
            search.updateQueue = false
        }
        search.updateGuard = false    
    })
    
    $('#filter-icon').on('click', function(){
        //$('#filter-data').toggle()
        console.log('nope, not ready yet')
    })
}


/**
 * About the filtering
 * The ui will be adapting itself to what i'm gonna do
 * So here's the deal
 * I need a hold a synthax where i can recursively add keys and items and relations between then
 * {op: 'OR', em: [{key: "name", data:"Bunbasaur"}, {key: "move", data:"SolarBeam"}]} //not recursively will show a pokemon named bunbasaur or a solar beam stuff
 * {op: 'OR', em: [{op: '',em: '', key: "name", data:"Bunbasaur"}, {key: "move", data:"SolarBeam"}, ]
 *  
 * } //recursive
 * [ 'OR', [['', '','name', '']['','','move','solar beam']], '', ''
 * ] // optimized recursive
 * 
 * and now the hard part the parsing
 * each pannel will have an update() function that will eat up the request.
 * an util with be shared in search that will just need the request and an object mapped with function
 * the key of the mapped object will be a name of a request key
 * the key will point to a function that will eat the data and return true if it matched, or false if it didn't
 */

/**
 * @callback searchAssertion
 * @param {unknow} data
 * @param {string} queryData
 *  
 * @returns {boolean} did it matched? //OUPPPS missed that sometimes it should NOT match
 * 
 * @typedef {Object.<string, searchAssertion>} SearchMap
 * 
 * @typedef {Object} Query - a query
 * @property {string} op - Operation to do to all direct sub elements
 * @property {Query} sq - a sub query
 * @property {keyof SearchMap} k - a key to 
 * @param {boolean} [not=false] - should it not match
 * @property {string} queryData - string to compare it to the data
 * 
 * @param {Query} query - a query to feed 
 * @param {Object} data - the data to query on
 * @param {SearchMap} keymap - a map with key (k) which points to a function return a function
 * @returns {boolean} - did the object matched?
 */
//! NOT READY YET <= in cooking
export function query(query, data, keymap){
    // at the smallest level here what it is
    const execFn = keymap[query.k]
    if (execFn) {
        return query.not ? !execFn(query.data, data) : execFn(query.data, data)
    }

}