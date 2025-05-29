import { describe, it, expect } from 'vitest'
import parse, { parseNamedArgs } from '@/tools/parse'
import { RawMatch } from '@/tools/types'

describe('parse', () => {
    describe('parseNamedArgs', () => {
        it('should parse simple key', () => {
            const groups = { paramNameKeys: 'name', type: 's' } as RawMatch
            expect(parseNamedArgs(groups)).toEqual(['name'])
        })

        it('should parse nested keys with dot notation', () => {
            const groups = { paramNameKeys: 'user.name', type: 's' } as RawMatch
            expect(parseNamedArgs(groups)).toEqual(['user', 'name'])
        })

        it('should parse nested keys with bracket notation', () => {
            const groups = { paramNameKeys: 'user[0]', type: 's' } as RawMatch
            expect(parseNamedArgs(groups)).toEqual(['user', '0'])
        })

        it('should parse complex nested keys', () => {
            const groups = { paramNameKeys: 'users[0].profile.name', type: 's' } as RawMatch
            expect(parseNamedArgs(groups)).toEqual(['users', '0', 'profile', 'name'])
        })

        it('should throw error for invalid key', () => {
            const groups = { paramNameKeys: '[invalid', type: 's' } as RawMatch
            expect(() => parseNamedArgs(groups)).toThrow('[sprintf] failed to parse named argument key')
        })

        it('should throw error for empty key', () => {
            const groups = { paramNameKeys: '', type: 's' } as RawMatch
            expect(() => parseNamedArgs(groups)).toThrow('[sprintf] failed to parse named argument key')
        })

        it('should throw error for key with invalid character in the middle', () => {
            const groups = { paramNameKeys: 'user@name', type: 's' } as RawMatch
            expect(() => parseNamedArgs(groups)).toThrow('[sprintf] failed to parse named argument key')
        })
    })

    describe('parse', () => {
        it('should parse simple string without placeholders', () => {
            const result = parse('Hello, world!')
            expect(result).toEqual(['Hello, world!'])
        })

        it('should parse string with simple placeholder', () => {
            const result = parse('Hello, %s!')
            expect(result).toHaveLength(3)
            expect(result[0]).toBe('Hello, ')
            expect(typeof result[1]).toBe('object')
            expect(result[1]).toMatchObject({
                placeholder: '%s',
                type: 's',
                sign: false,
                leftAlign: false
            })
            expect(result[2]).toBe('!')
        })

        it('should parse string with multiple placeholders', () => {
            const result = parse('Hello, %s! You are %d years old.')
            expect(result).toHaveLength(5)
            expect(result[0]).toBe('Hello, ')
            expect(typeof result[1]).toBe('object')
            expect(result[1]).toMatchObject({
                placeholder: '%s',
                type: 's'
            })
            expect(result[2]).toBe('! You are ')
            expect(typeof result[3]).toBe('object')
            expect(result[3]).toMatchObject({
                placeholder: '%d',
                type: 'd'
            })
            expect(result[4]).toBe(' years old.')
        })

        it('should parse string with explicit parameter numbers', () => {
            const result = parse('Hello, %1$s! You are %2$d years old.')
            expect(result).toHaveLength(5)
            expect(typeof result[1]).toBe('object')
            expect(result[1]).toMatchObject({
                placeholder: '%1$s',
                paramNumber: 1,
                type: 's'
            })
            expect(typeof result[3]).toBe('object')
            expect(result[3]).toMatchObject({
                placeholder: '%2$d',
                paramNumber: 2,
                type: 'd'
            })
        })

        it('should parse string with named parameters', () => {
            const result = parse('Hello, %(name)s! You are %(age)d years old.')
            expect(result).toHaveLength(5)
            expect(typeof result[1]).toBe('object')
            expect(result[1]).toMatchObject({
                placeholder: '%(name)s',
                paramNameKeys: ['name'],
                type: 's'
            })
            expect(typeof result[3]).toBe('object')
            expect(result[3]).toMatchObject({
                placeholder: '%(age)d',
                paramNameKeys: ['age'],
                type: 'd'
            })
        })

        it('should parse string with complex formatting options', () => {
            const result = parse('Value: %+05.2f')
            expect(result).toHaveLength(2)
            expect(typeof result[1]).toBe('object')
            expect(result[1]).toMatchObject({
                placeholder: '%+05.2f',
                sign: true,
                padChar: '0',
                width: 5,
                precision: 2,
                type: 'f'
            })
        })

        it('should parse string with escaped percent sign', () => {
            const result = parse('100%% complete')
            expect(result).toEqual(['100', '%', ' complete'])
        })

        it('should throw error for unexpected placeholder', () => {
            expect(() => parse('Hello, %z!')).toThrow('[sprintf] unexpected placeholder')
        })

        it('should cache parsed format strings', () => {
            const format = 'Hello, %s!'
            const result1 = parse(format)
            const result2 = parse(format)
            expect(result1).toBe(result2) // Same object reference due to caching
        })
    })
})
