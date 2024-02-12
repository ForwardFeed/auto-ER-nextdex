export function regexGrabStr(line, regex, byDefault) {
    if (byDefault === void 0) { byDefault = "Default"; }
    var grabbed = line.match(regex);
    return grabbed ? grabbed[0] : byDefault;
}
export function regexGrabNum(line, regex, byDefault) {
    if (byDefault === void 0) { byDefault = 0; }
    var grabbed = line.match(regex);
    if (!grabbed) {
        return byDefault;
    }
    return isNaN(+grabbed) ? byDefault : +grabbed;
}
export function upperCaseFirst(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
export function Xtox(prefix, X) {
    return X.replace(prefix, '')
        .toLowerCase().replace(/_/g, ' ')
        .split(' ')
        .map(function (x) { return upperCaseFirst(x); })
        .join(' ');
}
