/**
 * This File is for code documentation purpose
 * This is a template of a multi files part parsing method
 *
 * The function of all of this is the following:
 * From a whatever data format to convert it into a JSON format used after in the UI
 *
 * you may find this kind of structure of the species parsing which involves a lot of data
 */
function initWhateverData() {
    return {
        name: ""
    };
}
/**
 * using a function that ensure that all the data is at least
 * correctly initialiazed is much more useful than a type assertion
 */
function initContext() {
    return {
        dataCollection: [],
        current: initWhateverData(),
        currentKey: "",
        execFlag: "awaitData", // 
        stopRead: false
    };
}
/**
 * this may look unorthodox, but it reduce the if else of one level systematically
 * !TODO finish this
 */
var executionMap = {
    "awaitData": function (line, context) {
        if (line.match('trigger')) {
            context.execFlag = "main";
        }
    },
    "main": function (line, context) {
        if (line.match('data detected')) {
            //grab data from
        }
        if (line.match('};')) {
            //stop the reading at this
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
        data: context.dataCollection
    };
}
