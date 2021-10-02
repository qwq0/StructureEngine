export function forEach(o, callback)
{
    if (!o)
        return false;
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

export function forEachRev(o, callback)
{
    if (!o)
        return false;
    for (var i = o.length - 1; i >= 0; i--)
        if (o[i] != undefined && callback(o[i], i))
            return true;
    return false;
}

export function isAmong(k, ...s)
{
    return forEach(s, o => o == k);
}

export function findEmpty(o)
{
    for (var i = 0, Li = o.length; i < Li; i++)
        if (o[i] == undefined)
            return i;
    return -1;
}