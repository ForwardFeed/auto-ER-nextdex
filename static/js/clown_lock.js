/**
 * a Clown lock for a clown problem (we live a society)
 * (it's actually extremely weak, but as long it stops at least 90% of people it's fine)
 * (it's also supripsingly funny to do)
*/
/**
 * 
 * @param {Event} event 
 */
function antiHTMLRemoval(event){
    if ($(event.target).closest('#clown-lock').length) return
    event.stopImmediatePropagation()
    event.stopPropagation()
}

function antiBasicSpam(){
    $('#clown-input').hide()
    setTimeout(function(){
        $('#clown-input').show().trigger('focus')
    }, 1000)
}

export function activateLock(){
    function trytry(key){
        if (key === "Darkystole1billionpesos") {
            if (localStorage) localStorage.setItem('AutoERdexPass', key)
            deActivateLock()
        } else {
            antiBasicSpam()
        }
    }
    document.addEventListener('click', antiHTMLRemoval, true)
    document.getElementById('clown-input').onkeydown = function(ev){
        if (ev.key === 'Enter') {
            trytry(this.value)
        }
    }
    document.getElementById('clown-input').value = localStorage.getItem('AutoERdexPass') || ""
    if (document.getElementById('clown-input').value) trytry(document.getElementById('clown-input').value)
}

function deActivateLock(){
    document.removeEventListener('mousedown', antiHTMLRemoval)
    document.getElementById('clown-lock').remove()
}