import { hydrate } from './hydrate.js'
import { saveToLocalstorage, fetchFromLocalstorage } from './settings.js';
import { fetchGameData } from './fetcher/main.js';
/**
 * To select which version of the game data to have
 */
/**@type {import('./compactify.js').CompactGameData} */
export let gameData;

// each time the data is modified, this is updated
// so the client checks if it have the latest version by checking lo
const LATEST_DATA_VERSION = "1"/*%%VERSION%%*/

const allVersions = [
    "master",
    "ReduxForms",
]
const defaultVersion = allVersions[0]
export const depotURL = "https:\/\/raw.githubusercontent.com/Elite-Redux/eliteredux/"
export let branch = defaultVersion

function setAvailableVersion(){
    const fragment = document.createDocumentFragment()
    for (const version of allVersions){
        const option = document.createElement('option')
        option.value = version
        option.innerText = version
        fragment.append(option)
    }
    $('#versions').append(fragment).val(defaultVersion).change()
}

function changeVersion(version, forceRefresh=false){
    if (!version || allVersions.indexOf(version) == -1){
        return console.warn(`no such version : ${version}`)
    }
    const savedVersion = fetchFromLocalstorage("dataversion"+version)
    //deactivate fetching from localstorage for iOS product
    // as it has an unknown device, i would gladly have someone with an Apple to help me fixing it out
    if (!forceRefresh && savedVersion && savedVersion == LATEST_DATA_VERSION &&
        $('#enable-storage')[0].checked ){
        gameData = JSON.parse(fetchFromLocalstorage("data"+version))
        if (gameData) {
            console.log("took gamedata from storage")
            hydrate()
            return
        }
    }
    //fetch and parse remotely
    branch = version
    fetchGameData({depot_url: depotURL, branch: version})
        .then((data) => {
            console.log("took gamedata from server")
            gameData = data
            saveToLocalstorage("data"+version, gameData)
            hydrate()
            saveToLocalstorage("dataversion"+version, LATEST_DATA_VERSION)
    })
}

export function setupDataVersionning(){
    setAvailableVersion()
    $('#refresh-gamedata').on('click', function(){
        changeVersion($('#versions').val(), true)
    })
    $('#versions').on('change', function(){
        changeVersion($('#versions').val())
        saveToLocalstorage("lastusedversion", $(this).val())
    })
    const lastUsedVersion = fetchFromLocalstorage("lastusedversion") || defaultVersion
    $('#versions').val(lastUsedVersion).change()
    
}

