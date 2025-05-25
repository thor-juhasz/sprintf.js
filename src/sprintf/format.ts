import { sprintf } from '@/index'
import { ArgList, ParseTree, FormatPlaceholder } from '@/sprintf/types'
import { regexes, truncate } from '@/sprintf/utils'

/**
 * Scan the parseTree, figure out
 *   • used arg slots = all explicit %n$ slots
 *   • namedSlot = first explicit %n$(…) slot, or nextFree(used)
 * then in a second pass assign each placeholder a `.resolved` index:
 *   explicit → paramNumber-1
 *   named → namedSlot-1
 *   normal → nextFree(used,taken)-1
 */
function resolveSlots(parseTree: ParseTree) {
    /**
     * Holds the used slots by explicitly positioned placeholders.
     */
    const used = new Set<number>()

    /**
     * Holds the slot number for the first named argument with an explicit position.
     * If there is no such placeholder, the value remains null.
     */
    let namedSlot: number | null = null

    /**
     * Iterate over all placeholders and collect the used slots.
     */
    for (const placeholder of parseTree) {
        if (typeof placeholder === 'object' && placeholder.paramNumber) {
            const n = placeholder.paramNumber
            used.add(n)

            if (placeholder.paramNameKeys && namedSlot === null) {
                namedSlot = n
            }
        }
    }

    /**
     * Find the next free slot.
     */
    function nextFree(used: Set<number>, taken: Set<number>) {
        let i = 1
        while (used.has(i) || taken.has(i)) {
            i++
        }

        return i
    }

    /**
     * Holds the taken slots as they get assigned by implicitly positioned placeholders.
     */
    const taken = new Set<number>()

    /**
     * Iterate over all placeholders and assign a `.resolved` index.
     */
    for (const node of parseTree) {
        if (typeof node !== 'object') {
            continue
        }

        const placeholder = node as FormatPlaceholder & { resolved: number }

        let slot: number

        if (placeholder.paramNumber) {
            slot = placeholder.paramNumber
        } else if (placeholder.paramNameKeys) {
            if (namedSlot === null) {
                namedSlot = nextFree(used, taken)
            }
            slot = namedSlot
        } else {
            slot = nextFree(used, taken)
        }

        taken.add(slot)
        // Arguments are 1-indexed, placeholders are 0-indexed.
        placeholder.resolved = slot - 1
    }
}

/**
 * Format a string according to the given format string and arguments
 */
export default function format(parseTree: ParseTree, argv: ArgList): string {
    resolveSlots(parseTree)

    let output = ''

    if (parseTree.filter(node => typeof node !== 'string').length > 0 && argv.length === 0) {
        throw new TypeError(sprintf('[sprintf] expecting at least 1 argument, got %d', argv.length))
    }

    for (const node of parseTree) {
        if (typeof node === 'string') {
            output += node
            continue
        }

        const placeholder = node as FormatPlaceholder & { resolved: number }
        let arg = argv[placeholder.resolved]

        if (placeholder.paramNameKeys) { // keyword argument
            for (const key of placeholder.paramNameKeys) {
                if (!arg) {
                    const which = arg === null ? 'null' : 'undefined'
                    throw new Error(sprintf('[sprintf] Cannot access property "%s" of "%s"', key, which))
                }

                arg = arg[key]
            }
        }

        if (regexes.notType.test(placeholder.type) && regexes.notPrimitive.test(placeholder.type) && arg instanceof Function) {
            arg = arg()
        }

        if (regexes.numericArg.test(placeholder.type) && (typeof arg !== 'number' && isNaN(arg))) {
            throw new TypeError(sprintf('[sprintf] expecting number but found %T', arg))
        }

        let isPositive = true
        if (regexes.number.test(placeholder.type)) {
            isPositive = arg >= 0
        }

        switch (placeholder.type) {
            case 'b':
                arg = parseInt(arg, 10).toString(2)
                break
            case 'c':
                arg = String.fromCharCode(parseInt(arg, 10))
                break
            case 'd':
            case 'i':
                arg = parseInt(arg, 10)
                break
            case 'j':
                arg = JSON.stringify(arg, null, placeholder.width ? placeholder.width : 0)
                break
            case 'e':
                arg = placeholder.precision ? parseFloat(arg).toExponential(placeholder.precision) : parseFloat(arg).toExponential()
                break
            case 'f':
                arg = placeholder.precision ? parseFloat(arg).toFixed(placeholder.precision) : parseFloat(arg)
                break
            case 'g':
                arg = placeholder.precision ? String(Number(arg.toPrecision(placeholder.precision))) : parseFloat(arg)
                break
            case 'o':
                arg = (parseInt(arg, 10) >>> 0).toString(8)
                break
            case 's':
                arg = String(arg)
                arg = truncate(arg, placeholder.precision)
                break
            case 't':
                arg = String(!!arg)
                arg = truncate(arg, placeholder.precision)
                break
            case 'T':
                arg = Object.prototype.toString.call(arg).slice(8, -1).toLowerCase()
                arg = truncate(arg, placeholder.precision)
                break
            case 'u':
                arg = parseInt(arg, 10) >>> 0
                break
            case 'v':
                arg = String(arg.valueOf())
                arg = truncate(arg, placeholder.precision)
                break
            case 'x':
                arg = (parseInt(arg, 10) >>> 0).toString(16)
                break
            case 'X':
                arg = (parseInt(arg, 10) >>> 0).toString(16).toUpperCase()
                break
        }

        if (regexes.json.test(placeholder.type)) {
            output += arg
        } else {
            let sign = ''

            if (regexes.number.test(placeholder.type)) {
                if (!isPositive || placeholder.sign) {
                    sign = isPositive ? '+' : '-'
                    arg = arg.toString().replace(regexes.sign, '')
                } else {
                    sign = ''
                }
            }

            const padCharacter = placeholder.padChar ? placeholder.padChar === '0' ? '0' : placeholder.padChar.charAt(1) : ' '
            let pad = ''

            if (placeholder.width) {
                const padLength = Math.max(0, placeholder.width - (sign + arg).length)
                pad = padCharacter.repeat(padLength)
            }

            output += placeholder.leftAlign ? sign + arg + pad : (padCharacter === '0' ? sign + pad + arg : pad + sign + arg)
        }
    }
    return output
}
