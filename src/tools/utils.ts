import { RawMatch } from '@/tools/types'

const paramNumberRegex = /(?:(?<paramNumber>[1-9]\d*)\$)?/
const paramNameKeysRegex = /(?:\((?<paramNameKeys>[^)]+)\))?/
const signRegex = /(?<sign>\+)?/
const padCharRegex = /(?<padChar>0|'[^$])?/
const leftAlignRegex = /(?<leftAlign>-)?/
const widthRegex = /(?<width>\d+)?/
const precisionRegex = /(?:\.(?<precision>\d+))?/
const typeRegex = /(?<type>[b-gijostTuvxX])/

export const regexes = {
    notString: /[^s]/,
    notBool: /[^t]/,
    notType: /[^T]/,
    notPrimitive: /[^v]/,
    number: /[diefg]/,
    numericArg: /[bcdiefguxX]/,
    json: /j/,
    notJson: /[^j]/,
    text: /^[^\x25]+/,
    modulo: /^\x25{2}/,
    placeholder: new RegExp(
        '^\x25' +
        paramNumberRegex.source +
        paramNameKeysRegex.source +
        signRegex.source +
        padCharRegex.source +
        leftAlignRegex.source +
        widthRegex.source +
        precisionRegex.source +
        typeRegex.source,
    ),
    key: /^([a-z_][a-z_\d]*)/i,
    keyAccess: /^\.([a-z_][a-z_\d]*)/i,
    indexAccess: /^\[(\d+)]/,
    sign: /^[+-]/
}

export function hasRawGroups(groups: unknown): groups is RawMatch {
    return typeof groups === 'object' && groups !== null
}

export function truncate(val: string, precision?: number): string {
    return val.substring(0, precision)
}
