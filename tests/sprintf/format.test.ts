import { describe, it, expect } from 'vitest'
import format from '@/sprintf/format'
import parse from '@/sprintf/parse'

describe('format', () => {
    it('should format a string with no placeholders', () => {
        const parseTree = parse('Hello, world!')
        expect(format(parseTree, [])).toBe('Hello, world!')
    })

    it('should format a string with simple placeholders', () => {
        const parseTree = parse('Hello, %s!')
        expect(format(parseTree, ['world'])).toBe('Hello, world!')
    })

    it('should format a string with multiple placeholders', () => {
        const parseTree = parse('Hello, %s! You are %d years old.')
        expect(format(parseTree, ['John', 30])).toBe('Hello, John! You are 30 years old.')
    })

    it('should format a string with explicit parameter numbers', () => {
        const parseTree = parse('Hello, %2$s! You are %1$d years old.')
        expect(format(parseTree, [30, 'John'])).toBe('Hello, John! You are 30 years old.')
    })

    it('should format a string with named parameters', () => {
        const parseTree = parse('Hello, %(name)s! You are %(age)d years old.')
        expect(format(parseTree, [{ name: 'John', age: 30 }])).toBe('Hello, John! You are 30 years old.')
    })

    it('should format a string with nested named parameters', () => {
        const parseTree = parse('Hello, %(user.name)s! You are %(user.age)d years old.')
        expect(format(parseTree, [{ user: { name: 'John', age: 30 } }])).toBe('Hello, John! You are 30 years old.')
    })

    it('should format a string with array indexed parameters', () => {
        const parseTree = parse('First: %(users[0])s, Second: %(users[1])s')
        expect(format(parseTree, [{ users: ['John', 'Jane'] }])).toBe('First: John, Second: Jane')
    })

    it('should throw an error when accessing property of undefined', () => {
        const parseTree = parse('Hello, %(user.name)s!')
        expect(() => format(parseTree, [null])).toThrow('[sprintf] Cannot access property "user" of "null"')
        const parseTree2 = parse('Hello, %(user.name)s!')
        expect(() => format(parseTree2, [{ user: null }])).toThrow('[sprintf] Cannot access property "name" of "null"')
    })

    it('should call functions for non-primitive types', () => {
        const parseTree = parse('Result: %s')
        const fn = () => 'function result'
        expect(format(parseTree, [fn])).toBe('Result: function result')
    })

    it('should throw an error for non-numeric arguments with numeric format', () => {
        const parseTree = parse('Number: %d')
        expect(() => format(parseTree, ['not a number'])).toThrow('[sprintf] expecting number but found')
    })

    describe('format types', () => {
        it('should format binary (%b)', () => {
            const parseTree = parse('Binary: %b')
            expect(format(parseTree, [10])).toBe('Binary: 1010')
        })

        it('should format character (%c)', () => {
            const parseTree = parse('Char: %c')
            expect(format(parseTree, [65])).toBe('Char: A')
        })

        it('should format decimal (%d, %i)', () => {
            const parseTree = parse('Decimal: %d, Integer: %i')
            expect(format(parseTree, [42, 42.9])).toBe('Decimal: 42, Integer: 42')
        })

        it('should format JSON (%j)', () => {
            const parseTree = parse('JSON: %j')
            expect(format(parseTree, [{ a: 1, b: 2 }])).toBe('JSON: {"a":1,"b":2}')
        })

        it('should format JSON with indentation (%j with width)', () => {
            const parseTree = parse('JSON: %2j')
            expect(format(parseTree, [{ a: 1, b: 2 }])).toBe('JSON: {\n  "a": 1,\n  "b": 2\n}')
        })

        it('should format exponential (%e)', () => {
            const parseTree = parse('Exp: %e')
            expect(format(parseTree, [12345])).toBe('Exp: 1.2345e+4')
        })

        it('should format exponential with precision (%e)', () => {
            const parseTree = parse('Exp: %.2e')
            expect(format(parseTree, [12345])).toBe('Exp: 1.23e+4')
        })

        it('should format float (%f)', () => {
            const parseTree = parse('Float: %f')
            expect(format(parseTree, [3.14159])).toBe('Float: 3.14159')
        })

        it('should format float with precision (%f)', () => {
            const parseTree = parse('Float: %.2f')
            expect(format(parseTree, [3.14159])).toBe('Float: 3.14')
        })

        it('should format general (%g)', () => {
            const parseTree = parse('General: %g')
            expect(format(parseTree, [3.14159])).toBe('General: 3.14159')
        })

        it('should format general with precision (%g)', () => {
            const parseTree = parse('General: %.3g')
            expect(format(parseTree, [3.14159])).toBe('General: 3.14')
        })

        it('should format octal (%o)', () => {
            const parseTree = parse('Octal: %o')
            expect(format(parseTree, [8])).toBe('Octal: 10')
        })

        it('should format string (%s)', () => {
            const parseTree = parse('String: %s')
            expect(format(parseTree, ['hello'])).toBe('String: hello')
        })

        it('should format string with precision (%s)', () => {
            const parseTree = parse('String: %.3s')
            expect(format(parseTree, ['hello'])).toBe('String: hel')
        })

        it('should format boolean (%t)', () => {
            const parseTree = parse('Bool: %t, Bool: %t')
            expect(format(parseTree, [true, false])).toBe('Bool: true, Bool: false')
        })

        it('should format type (%T)', () => {
            const parseTree = parse('Type: %T, Type: %T, Type: %T')
            expect(format(parseTree, ['string', 123, { a: 1 }])).toBe('Type: string, Type: number, Type: object')
        })

        it('should format unsigned integer (%u)', () => {
            const parseTree = parse('Unsigned: %u, Unsigned: %u')
            expect(format(parseTree, [42, -42])).toBe('Unsigned: 42, Unsigned: 4294967254')
        })

        it('should format value (%v)', () => {
            const parseTree = parse('Value: %v')
            const obj = { valueOf: () => 'custom value' }
            expect(format(parseTree, [obj])).toBe('Value: custom value')
        })

        it('should format hex lowercase (%x)', () => {
            const parseTree = parse('Hex: %x')
            expect(format(parseTree, [255])).toBe('Hex: ff')
        })

        it('should format hex uppercase (%X)', () => {
            const parseTree = parse('Hex: %X')
            expect(format(parseTree, [255])).toBe('Hex: FF')
        })
    })

    describe('formatting options', () => {
        it('should apply sign', () => {
            const parseTree = parse('Value: %+d, Value: %+d')
            expect(format(parseTree, [42, -42])).toBe('Value: +42, Value: -42')
        })

        it('should apply padding with spaces', () => {
            const parseTree = parse('Value: %5d')
            expect(format(parseTree, [42])).toBe('Value:    42')
        })

        it('should apply padding with zeros', () => {
            const parseTree = parse('Value: %05d')
            expect(format(parseTree, [42])).toBe('Value: 00042')
        })

        it('should apply padding with custom character', () => {
            const parseTree = parse("Value: %'*5d")
            expect(format(parseTree, [42])).toBe('Value: ***42')
        })

        it('should apply no padding with 0 pad width', () => {
            const parseTree = parse("Value: %0-0d")
            expect(format(parseTree, [42])).toBe('Value: 42')
        })

        it('should apply left alignment', () => {
            const parseTree = parse('Value: %-5d')
            expect(format(parseTree, [42])).toBe('Value: 42   ')
        })

        it('should apply precision', () => {
            const parseTree = parse('Value: %.2f')
            expect(format(parseTree, [3.14159])).toBe('Value: 3.14')
        })

        it('should apply width and precision', () => {
            const parseTree = parse('Value: %8.2f')
            expect(format(parseTree, [3.14159])).toBe('Value:     3.14')
        })

        it('should apply sign, padding, and precision', () => {
            const parseTree = parse('Value: %+08.2f')
            expect(format(parseTree, [3.14159])).toBe('Value: +0003.14')
        })

        it('should apply left alignment with sign and precision', () => {
            const parseTree = parse('Value: %+-8.2f')
            expect(format(parseTree, [3.14159])).toBe('Value: +3.14   ')
        })
    })
})
