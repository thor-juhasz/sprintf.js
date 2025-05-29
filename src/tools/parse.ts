import { FormatPlaceholder, ParseTree, RawMatch } from '@/tools/types'
import { hasRawGroups, regexes } from '@/tools/utils'

const sprintfCache: Map<string, ParseTree> = new Map()

export function parseNamedArgs(groups: RawMatch): string[] {
    const fieldList: string[] = []

    let replacementField = groups.paramNameKeys!
    let fieldMatch: RegExpExecArray | null = regexes.key.exec(replacementField)

    if (fieldMatch !== null) {
        fieldList.push(fieldMatch[1])

        while ((replacementField = replacementField.substring(fieldMatch[0].length)) !== '') {
            if ((fieldMatch = regexes.keyAccess.exec(replacementField)) !== null) {
                fieldList.push(fieldMatch[1])
            } else if ((fieldMatch = regexes.indexAccess.exec(replacementField)) !== null) {
                fieldList.push(fieldMatch[1])
            } else {
                throw new SyntaxError('[sprintf] failed to parse named argument key')
            }
        }
    } else {
        throw new SyntaxError('[sprintf] failed to parse named argument key')
    }
    return fieldList
}

/**
 * Parse a format string into a tree of placeholders and literal strings
 */
export default function parse(format: string): ParseTree {
    if (sprintfCache.has(format)) {
        return sprintfCache.get(format)!
    }

    const parseTree: ParseTree = []
    let _format = format
    // let usedArgKinds = ArgKind.None

    while (_format) {
        let match: RegExpExecArray | null

        if ((match = regexes.text.exec(_format))) {
            parseTree.push(match[0])
        } else if ((match = regexes.modulo.exec(_format))) {
            parseTree.push('%')
        } else if ((match = regexes.placeholder.exec(_format)) && hasRawGroups(match.groups)) {
            const groups = match.groups

            const formatPlaceholder: FormatPlaceholder = {
                placeholder: match[0],
                paramNumber: groups.paramNumber ? Number(groups.paramNumber) : undefined,
                sign: !!groups.sign,
                padChar: groups.padChar,
                leftAlign: !!groups.leftAlign,
                width: groups.width ? Number(groups.width) : undefined,
                precision: groups.precision ? Number(groups.precision) : undefined,
                type: groups.type,
            }

            if (groups.paramNameKeys) {
                formatPlaceholder.paramNameKeys = parseNamedArgs(groups)
            }

            parseTree.push(formatPlaceholder)
        } else {
            throw new SyntaxError('[sprintf] unexpected placeholder')
        }

        _format = _format.substring(match[0].length)
    }

    sprintfCache.set(format, parseTree)

    return parseTree
}
