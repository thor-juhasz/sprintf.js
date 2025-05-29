import { bench, describe } from 'vitest'
import { sprintf } from '@/sprintf'
import {
    TestCase,
    complexExplicit,
    complexImplicit,
    complexNamedExplicit,
    complexNamedImplicit,
    mixedCases,
    simplestExplicit,
    simplestImplicit,
    simplestNamedExplicit,
    simplestNamedImplicit,
} from '@tests/fixtures/cases'

function benchEach<Case extends readonly TestCase[]>(
    cases: Case,
    fn: (fmt: Case[number][1], args: Case[number][2]) => void
) {
    for (const [title, format, args] of cases) {
        bench(title, () => fn(format, args))
    }
}

describe('sprintf', () => {
    benchEach(simplestImplicit,      (fmt, args) => sprintf(fmt, ...args))
    benchEach(simplestExplicit,      (fmt, args) => sprintf(fmt, ...args))
    benchEach(simplestNamedImplicit, (fmt, args) => sprintf(fmt, ...args))
    benchEach(simplestNamedExplicit, (fmt, args) => sprintf(fmt, ...args))
    benchEach(complexImplicit,       (fmt, args) => sprintf(fmt, ...args))
    benchEach(complexExplicit,       (fmt, args) => sprintf(fmt, ...args))
    benchEach(complexNamedImplicit,  (fmt, args) => sprintf(fmt, ...args))
    benchEach(complexNamedExplicit,  (fmt, args) => sprintf(fmt, ...args))
    benchEach(mixedCases,            (fmt, args) => sprintf(fmt, ...args))
})
