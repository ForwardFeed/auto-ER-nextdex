import setupPanels from "./sidebar.js"
import { setupSpeciesSubPanel } from "./species_panel.js"
import { setAvailableVersion } from "./data_version.js"
import { setupSearch } from "./search.js"

$(document).ready(function(){
    setupPanels()
    setupSpeciesSubPanel()
    setAvailableVersion()
    setupSearch()
    setupSettings()
})