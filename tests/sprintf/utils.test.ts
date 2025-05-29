import { describe, it, expect } from 'vitest'
import { regexes, hasRawGroups, truncate } from '@/tools/utils'

describe('utils', () => {
    describe('regexes', () => {
        it('should have all required regex patterns', () => {
            expect(regexes.notString).toBeDefined()
            expect(regexes.notBool).toBeDefined()
            expect(regexes.notType).toBeDefined()
            expect(regexes.notPrimitive).toBeDefined()
            expect(regexes.number).toBeDefined()
            expect(regexes.numericArg).toBeDefined()
            expect(regexes.json).toBeDefined()
            expect(regexes.notJson).toBeDefined()
            expect(regexes.text).toBeDefined()
            expect(regexes.modulo).toBeDefined()
            expect(regexes.placeholder).toBeDefined()
            expect(regexes.key).toBeDefined()
            expect(regexes.keyAccess).toBeDefined()
            expect(regexes.indexAccess).toBeDefined()
            expect(regexes.sign).toBeDefined()
        })

        it('should match text correctly', () => {
            expect(regexes.text.exec('hello %s')?.[0]).toBe('hello ')
            expect(regexes.text.exec('%s')).toBeNull()
        })

        it('should match modulo correctly', () => {
            expect(regexes.modulo.exec('%%')?.[0]).toBe('%%')
            expect(regexes.modulo.exec('%s')).toBeNull()
        })

        it('should match placeholder correctly', () => {
            const match = regexes.placeholder.exec('%s')
            expect(match).not.toBeNull()
            expect(match?.groups?.type).toBe('s')

            const complexMatch = regexes.placeholder.exec('%+05.2f')
            expect(complexMatch).not.toBeNull()
            expect(complexMatch?.groups?.sign).toBe('+')
            expect(complexMatch?.groups?.padChar).toBe('0')
            expect(complexMatch?.groups?.width).toBe('5')
            expect(complexMatch?.groups?.precision).toBe('2')
            expect(complexMatch?.groups?.type).toBe('f')

            const namedMatch = regexes.placeholder.exec('%(name)s')
            expect(namedMatch).not.toBeNull()
            expect(namedMatch?.groups?.paramNameKeys).toBe('name')
            expect(namedMatch?.groups?.type).toBe('s')

            const explicitMatch = regexes.placeholder.exec('%2$d')
            expect(explicitMatch).not.toBeNull()
            expect(explicitMatch?.groups?.paramNumber).toBe('2')
            expect(explicitMatch?.groups?.type).toBe('d')
        })

        it('should match key correctly', () => {
            expect(regexes.key.exec('name')?.[1]).toBe('name')
            expect(regexes.key.exec('name123')?.[1]).toBe('name123')
            expect(regexes.key.exec('_name')?.[1]).toBe('_name')
            expect(regexes.key.exec('123name')).toBeNull()
        })

        it('should match keyAccess correctly', () => {
            expect(regexes.keyAccess.exec('.name')?.[1]).toBe('name')
            expect(regexes.keyAccess.exec('.name123')?.[1]).toBe('name123')
            expect(regexes.keyAccess.exec('._name')?.[1]).toBe('_name')
            expect(regexes.keyAccess.exec('.123name')).toBeNull()
        })

        it('should match indexAccess correctly', () => {
            expect(regexes.indexAccess.exec('[0]')?.[1]).toBe('0')
            expect(regexes.indexAccess.exec('[123]')?.[1]).toBe('123')
            expect(regexes.indexAccess.exec('[name]')).toBeNull()
        })

        it('should match sign correctly', () => {
            expect(regexes.sign.exec('+')?.[0]).toBe('+')
            expect(regexes.sign.exec('-')?.[0]).toBe('-')
            expect(regexes.sign.exec('123')).toBeNull()
        })
    })

    describe('hasRawGroups', () => {
        it('should return true for valid RawMatch objects', () => {
            expect(hasRawGroups({ type: 's' })).toBe(true)
            expect(hasRawGroups({ placeholder: '%s', type: 's' })).toBe(true)
        })

        it('should return false for null or undefined', () => {
            expect(hasRawGroups(null)).toBe(false)
            expect(hasRawGroups(undefined)).toBe(false)
        })

        it('should return false for non-objects', () => {
            expect(hasRawGroups('string')).toBe(false)
            expect(hasRawGroups(123)).toBe(false)
            expect(hasRawGroups(true)).toBe(false)
        })
    })

    describe('truncate', () => {
        it('should truncate a string to the specified precision', () => {
            expect(truncate('hello', 3)).toBe('hel')
            expect(truncate('hello', 5)).toBe('hello')
            expect(truncate('hello', 10)).toBe('hello')
        })

        it('should return the original string if precision is undefined', () => {
            expect(truncate('hello', undefined)).toBe('hello')
        })

        it('should return an empty string if precision is 0', () => {
            expect(truncate('hello', 0)).toBe('')
        })
    })
})
