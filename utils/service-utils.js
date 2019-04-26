function getTimeStamp() {
    return Math.round((new Date()).getTime() / 1000);
}

function okJSON(...args) {
    const baseJSON = { status: 'OK' };

    let i = 0;
    while (i < args.length) {
        const key = args[i++];
        const val = args[i++];
        baseJSON[key] = val;
    }

    return baseJSON;
}

function errorJSON(errMsg) {
    if (errMsg === undefined)
        return { status: 'error' };
    else
        return { status: 'error', error: errMsg };
}

module.exports.getTimeStamp = getTimeStamp;
module.exports.okJSON = okJSON;
module.exports.errorJSON = errorJSON;