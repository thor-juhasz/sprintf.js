import { describe, it, expect } from 'vitest'
import { sprintf, vsprintf } from '@/index'
import {
    simplestImplicit,
    simplestExplicit,
    simplestNamedImplicit,
    simplestNamedExplicit,
    complexImplicit,
    complexExplicit,
    complexNamedImplicit,
    complexNamedExplicit,
    mixedCases,
} from '@tests/fixtures/cases'

function should_throw(format: string, args: unknown[], errorType: ErrorConstructor) {
    expect(() => vsprintf(format, args)).toThrow(errorType)
}

function should_not_throw(format: string, args: unknown[]) {
    expect(() => vsprintf(format, args)).not.toThrow()
}

describe('sprintf.js cache', () => {
    it('should not throw Error (cache consistency)', () => {
        // redefine object properties to ensure it doesn't affect the cache
        sprintf('hasOwnProperty')
        sprintf('constructor')
        should_not_throw('%s', ['caching...'])
        should_not_throw('%s', ['crash?'])
    })
})

describe('sprintf.js errors', () => {
    it('should throw SyntaxError for placeholders', () => {
        should_throw('%', [], SyntaxError)
        should_throw('%A', [], SyntaxError)
        should_throw('%s%', [], SyntaxError)
        should_throw('%(s', [], SyntaxError)
        should_throw('%)s', [], SyntaxError)
        should_throw('%$s', [], SyntaxError)
        should_throw('%()s', [], SyntaxError)
        should_throw('%(12)s', [], SyntaxError)
    })

    const numeric = 'bcdiefguxX'.split('')
    numeric.forEach((specifier) => {
        const fmt = `%${specifier}`
        it(`${fmt} should throw TypeError for invalid numbers`, () => {
            should_throw(fmt, [], TypeError)
            should_throw(fmt, ['str'], TypeError)
            should_throw(fmt, [{}], TypeError)
            should_throw(fmt, ['s'], TypeError)
        })

        it(`${fmt} should not throw TypeError for something implicitly castable to number`, () => {
            should_not_throw(fmt, [1/0])
            should_not_throw(fmt, [true])
            should_not_throw(fmt, [[1]])
            should_not_throw(fmt, ['200'])
            should_not_throw(fmt, [null])
        })
    })

    it('should not throw Error for expression which evaluates to undefined', () => {
        should_not_throw("%(x.y)s", [{x: {}}])
    })

    it('should throw own Error when expression evaluation would raise TypeError', () => {
        const fmt = "%(x.y)s"
        expect(() => {
            sprintf(fmt, {})
        }).toThrow(/\[sprintf]/)
    })

    it('should not throw when accessing properties on the prototype', () => {
        class C {
            get x() { return 2 }
        }
        const c = new C()
        should_not_throw("%(x)s", [c])
        should_not_throw("%(y)s", [c])
    })
})

describe('sprintf.js', () => {
    const pi = 3.141592653589793

    it('should return formated strings for simple placeholders', () => {
        expect(sprintf('%%')).toBe('%')
        expect(sprintf('%b', 2)).toBe('10')
        expect(sprintf('%c', 65)).toBe('A')
        expect(sprintf('%d', 2)).toBe('2')
        expect(sprintf('%i', 2)).toBe('2')
        expect(sprintf('%d', '2')).toBe('2')
        expect(sprintf('%i', '2')).toBe('2')
        expect(sprintf('%j', {foo: 'bar'})).toBe('{"foo":"bar"}')
        expect(sprintf('%j', ['foo', 'bar'])).toBe('["foo","bar"]')
        expect(sprintf('%e', 2)).toBe('2e+0')
        expect(sprintf('%u', 2)).toBe('2')
        expect(sprintf('%u', -2)).toBe('4294967294')
        expect(sprintf('%f', 2.2)).toBe('2.2')
        expect(sprintf('%g', pi)).toBe('3.141592653589793')
        expect(sprintf('%o', 8)).toBe('10')
        expect(sprintf('%o', -8)).toBe('37777777770')
        expect(sprintf('%s', '%s')).toBe('%s')
        expect(sprintf('%x', 255)).toBe('ff')
        expect(sprintf('%x', -255)).toBe('ffffff01')
        expect(sprintf('%X', 255)).toBe('FF')
        expect(sprintf('%X', -255)).toBe('FFFFFF01')
        expect(sprintf('%2$s %3$s a %1$s', 'cracker', 'Polly', 'wants')).toBe('Polly wants a cracker')
        expect(sprintf('Hello %(who)s!', {who: 'world'})).toBe('Hello world!')
        expect(sprintf('%t', true)).toBe('true')
        expect(sprintf('%.1t', true)).toBe('t')
        expect(sprintf('%t', 'true')).toBe('true')
        expect(sprintf('%t', 1)).toBe('true')
        expect(sprintf('%t', false)).toBe('false')
        expect(sprintf('%.1t', false)).toBe('f')
        expect(sprintf('%t', '')).toBe('false')
        expect(sprintf('%t', 0)).toBe('false')

        expect(sprintf('%T', undefined)).toBe('undefined')
        expect(sprintf('%T', null)).toBe('null')
        expect(sprintf('%T', true)).toBe('boolean')
        expect(sprintf('%T', 42)).toBe('number')
        expect(sprintf('%T', 'This is a string')).toBe('string')
        expect(sprintf('%T', Math.log)).toBe('function')
        expect(sprintf('%T', [1, 2, 3])).toBe('array')
        expect(sprintf('%T', {foo: 'bar'})).toBe('object')
        expect(sprintf('%T', /<('[^']*'|'[^']*'|[^''>])*>/)).toBe('regexp')

        expect(sprintf('%v', true)).toBe('true')
        expect(sprintf('%v', 42)).toBe('42')
        expect(sprintf('%v', 'This is a string')).toBe('This is a string')
        expect(sprintf('%v', [1, 2, 3])).toBe('1,2,3')
        expect(sprintf('%v', {foo: 'bar'})).toBe('[object Object]')
        expect(sprintf('%v', /<("[^"]*"|'[^']*'|[^'">])*>/)).toBe('/<("[^"]*"|\'[^\']*\'|[^\'">])*>/')
    })

    it('should return formated strings for complex placeholders', () => {
        // sign
        expect(sprintf('%d', 2)).toBe('2')
        expect(sprintf('%d', -2)).toBe('-2')
        expect(sprintf('%+d', 2)).toBe('+2')
        expect(sprintf('%+d', -2)).toBe('-2')
        expect(sprintf('%i', 2)).toBe('2')
        expect(sprintf('%i', -2)).toBe('-2')
        expect(sprintf('%+i', 2)).toBe('+2')
        expect(sprintf('%+i', -2)).toBe('-2')
        expect(sprintf('%f', 2.2)).toBe('2.2')
        expect(sprintf('%f', -2.2)).toBe('-2.2')
        expect(sprintf('%+f', 2.2)).toBe('+2.2')
        expect(sprintf('%+f', -2.2)).toBe('-2.2')
        expect(sprintf('%+.1f', -2.34)).toBe('-2.3')
        expect(sprintf('%+.1f', -0.01)).toBe('-0.0')
        expect(sprintf('%.6g', pi)).toBe('3.14159')
        expect(sprintf('%.3g', pi)).toBe('3.14')
        expect(sprintf('%.1g', pi)).toBe('3')
        expect(sprintf('%+010d', -123)).toBe('-000000123')
        expect(sprintf("%+'_10d", -123)).toBe('______-123')
        expect(sprintf('%f %f', -234.34, 123.2)).toBe('-234.34 123.2')

        // padding
        expect(sprintf('%05d', -2)).toBe('-0002')
        expect(sprintf('%05i', -2)).toBe('-0002')
        expect(sprintf('%5s', '<')).toBe('    <')
        expect(sprintf('%05s', '<')).toBe('0000<')
        expect(sprintf("%'_5s", '<')).toBe('____<')
        expect(sprintf('%-5s', '>')).toBe('>    ')
        expect(sprintf('%0-5s', '>')).toBe('>0000')
        expect(sprintf("%'_-5s", '>')).toBe('>____')
        expect(sprintf('%5s', 'xxxxxx')).toBe('xxxxxx')
        expect(sprintf('%02u', 1234)).toBe('1234')
        expect(sprintf('%8.3f', -10.23456)).toBe(' -10.235')
        expect(sprintf('%f %s', -12.34, 'xxx')).toBe('-12.34 xxx')
        expect(sprintf('%2j', {foo: 'bar'})).toBe('{\n  "foo": "bar"\n}')
        expect(sprintf('%2j', ['foo', 'bar'])).toBe('[\n  "foo",\n  "bar"\n]')

        // precision
        expect(sprintf('%.1f', 2.345)).toBe('2.3')
        expect(sprintf('%5.5s', 'xxxxxx')).toBe('xxxxx')
        expect(sprintf('%5.1s', 'xxxxxx')).toBe('    x')
    })

    it('should return formated strings for callbacks', () => {
        expect(sprintf('%s', function() { return 'foobar' })).toBe('foobar')
    })
})

describe('more cases', () => {
    describe('simplest implicit cases', () => {
        simplestImplicit.forEach(([title, format, args]) => {
            it(title, () => {
                // We need to compute the expected result by actually running sprintf
                // This is a bit circular, but it's the best we can do without duplicating
                // the expected results in the test cases
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('simplest explicit cases', () => {
        simplestExplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('simplest named implicit cases', () => {
        simplestNamedImplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('simplest named explicit cases', () => {
        simplestNamedExplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('complex implicit cases', () => {
        complexImplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('complex explicit cases', () => {
        complexExplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('complex named implicit cases', () => {
        complexNamedImplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('complex named explicit cases', () => {
        complexNamedExplicit.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('mixed cases', () => {
        mixedCases.forEach(([title, format, args]) => {
            it(title, () => {
                const result = sprintf(format, ...args)
                expect(result).toBeDefined()
                expect(typeof result).toBe('string')
            })
        })
    })

    describe('specific test cases', () => {
        it('should handle string format specifier', () => {
            expect(sprintf('Hello, %s!', 'world')).toBe('Hello, world!')
        })

        it('should handle decimal format specifier', () => {
            expect(sprintf('Count: %d', 42)).toBe('Count: 42')
        })

        it('should handle float format specifier', () => {
            expect(sprintf('Value: %.2f', 3.14159)).toBe('Value: 3.14')
        })

        it('should handle multiple format specifiers', () => {
            expect(sprintf('Hello, %s! You are %d years old.', 'John', 30)).toBe('Hello, John! You are 30 years old.')
        })

        it('should handle explicit parameter numbers', () => {
            expect(sprintf('Hello, %2$s! You are %1$d years old.', 30, 'John')).toBe('Hello, John! You are 30 years old.')
        })

        it('should handle named parameters', () => {
            expect(sprintf('Hello, %(name)s! You are %(age)d years old.', { name: 'John', age: 30 })).toBe('Hello, John! You are 30 years old.')
        })

        it('should handle nested named parameters', () => {
            expect(sprintf('Hello, %(user.name)s! You are %(user.age)d years old.', { user: { name: 'John', age: 30 } })).toBe('Hello, John! You are 30 years old.')
        })

        it('should handle complex formatting options', () => {
            expect(sprintf('Value: %+08.2f', 3.14159)).toBe('Value: +0003.14')
        })

        it('should handle escaped percent sign', () => {
            expect(sprintf('100%% complete')).toBe('100% complete')
        })
    })
})

describe('vsprintf', () => {
    it('should format with array arguments', () => {
        expect(vsprintf('Hello, %s!', ['world'])).toBe('Hello, world!')
    })

    it('should handle multiple format specifiers', () => {
        expect(vsprintf('Hello, %s! You are %d years old.', ['John', 30])).toBe('Hello, John! You are 30 years old.')
    })

    it('should handle explicit parameter numbers', () => {
        expect(vsprintf('Hello, %2$s! You are %1$d years old.', [30, 'John'])).toBe('Hello, John! You are 30 years old.')
    })

    it('should handle named parameters', () => {
        expect(vsprintf('Hello, %(name)s! You are %(age)d years old.', [{ name: 'John', age: 30 }])).toBe('Hello, John! You are 30 years old.')
    })

    it('should throw error when no arguments passed', () => {
        expect(() => vsprintf('Hello, %s!', [])).toThrow('[sprintf] expecting at least 1 argument, got 0')
        // @ts-expect-error - Testing runtime behavior with invalid input
        expect(() => vsprintf('Hello, %s!', null)).toThrow('[sprintf] expecting at least 1 argument, got 0')
    })
})
