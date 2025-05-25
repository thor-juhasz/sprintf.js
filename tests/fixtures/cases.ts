export type BenchCase = [name: string, fmt: string, args: unknown[]]

export const simplestImplicit: BenchCase[] = [
    ['implicit: string %s',      'Hello %s',            ['world']],
    ['implicit: integer %d',     'Count: %d',           [42]],
    ['implicit: float %f',       'Value: %f',           [3.14]],
    ['implicit: binary %b',      'Bits: %b',            ['1010']],
    ['implicit: hex lower %x',   'Hex: %x',             [255]],
    ['implicit: hex upper %X',   'HEX: %X',             [255]],
    ['implicit: octal %o',       'Oct: %o',             ['7']],
    ['implicit: json %j',        'Data: %j',            [{ a: 1 }]],
    ['implicit: bool %t',        'Flag: %t',            [false]],
    ['implicit: type %T',        'Type: %T',            [{ foo: 'bar' }]],
    ['implicit: value %v',       'Val: %v',             [123]],
]

export const simplestExplicit: BenchCase[] = [
    ['explicit: string %1$s',    'Hello %1$s',          ['world']],
    ['explicit: integer %1$d',   'Count: %1$d',         [42]],
    ['explicit: float %1$f',     'Value: %1$f',         [3.14]],
    ['explicit: binary %1$b',    'Bits: %1$b',          ['1010']],
    ['explicit: hex lower %1$x', 'Hex: %1$x',           [255]],
    ['explicit: hex upper %1$X', 'HEX: %1$X',           [255]],
    ['explicit: octal %1$o',     'Oct: %1$o',           ['7']],
    ['explicit: json %1$j',      'Data: %1$j',          [{ a: 1 }]],
    ['explicit: bool %1$t',      'Flag: %1$t',          [false]],
    ['explicit: type %1$T',      'Type: %1$T',          [{ foo: 'bar' }]],
    ['explicit: value %1$v',     'Val: %1$v',           [123]],
]

export const simplestNamedImplicit: BenchCase[] = [
    ['implicit+named: string %(who)s',      'Hello %(who)s',           [{ who: 'Thor' }]],
    ['implicit+named: integer %(num)d',     'Count: %(num)d',          [{ num: 42 }]],
    ['implicit+named: float %(val)f',       'Value: %(val)f',          [{ val: 3.14 }]],
    ['implicit+named: binary %(bits)b',     'Bits: %(bits)b',          [{ bits: '1010' }]],
    ['implicit+named: hex lower %(h)x',     'Hex: %(h)x',              [{ h: 255 }]],
    ['implicit+named: hex upper %(H)X',     'HEX: %(H)X',              [{ H: 255 }]],
    ['implicit+named: octal %(o)o',         'Oct: %(o)o',              [{ o: '7' }]],
    ['implicit+named: json %(obj)j',        'Data: %(obj)j',           [{ obj: { a: 1 } }]],
    ['implicit+named: bool %(b)t',          'Flag: %(b)t',             [{ b: false }]],
    ['implicit+named: type %(x)T',          'Type: %(x)T',             [{ x: { foo: 'bar' } }]],
    ['implicit+named: value %(v)v',         'Val: %(v)v',              [{ v: 123 }]],
]

export const simplestNamedExplicit: BenchCase[] = [
    ['explicit+named: string %1$(who)s',      'Hello %1$(who)s',           [{ who: 'Thor' }]],
    ['explicit+named: integer %1$(num)d',     'Count: %1$(num)d',          [{ num: 42 }]],
    ['explicit+named: float %1$(val)f',       'Value: %1$(val)f',          [{ val: 3.14 }]],
    ['explicit+named: binary %1$(bits)b',     'Bits: %1$(bits)b',          [{ bits: '1010' }]],
    ['explicit+named: hex lower %1$(h)x',     'Hex: %1$(h)x',              [{ h: 255 }]],
    ['explicit+named: hex upper %1$(H)X',     'HEX: %1$(H)X',              [{ H: 255 }]],
    ['explicit+named: octal %1$(o)o',         'Oct: %1$(o)o',              [{ o: '7' }]],
    ['explicit+named: json %1$(obj)j',        'Data: %1$(obj)j',           [{ obj: { a: 1 } }]],
    ['explicit+named: bool %1$(b)t',          'Flag: %1$(b)t',             [{ b: false }]],
    ['explicit+named: type %1$(x)T',          'Type: %1$(x)T',             [{ x: { foo: 'bar' } }]],
    ['explicit+named: value %1$(v)v',         'Val: %1$(v)v',              [{ v: 123 }]],
]

export const complexImplicit: BenchCase[] = [
    ['implicit: pad+sign',     'Value: %+07.2f',                     [12.3456]],
    ['implicit: left align',   'Left: %-10s!',                       ['hi']],
    ['implicit: mixed types',  '%s %d %f %j',                        ['x', 1, 2.3, { z: 3 }]],
    ['implicit: width only',   'Num: %5d',                           [7]],
    ['implicit: precision',    'Pi: %.4f',                           [3.14159]],
    ['implicit: json pretty',  'Obj: %10j',                         [{ a:1, b:2 }]],
]

export const complexExplicit: BenchCase[] = [
    ['explicit: pad+sign',     'Value: %1$+07.2f',                   [12.3456]],
    ['explicit: left align',   'Left: %1$-10s!',                     ['hi']],
    ['explicit: mixed types',  '%1$s %2$d %3$f %4$j',                ['x', 1, 2.3, { z: 3 }]],
    ['explicit: width only',   'Num: %1$5d',                         [7]],
    ['explicit: precision',    'Pi: %1$.4f',                         [3.14159]],
    ['explicit: json pretty',  'Obj: %1$10j',                       [{ a:1, b:2 }]],
]

export const complexNamedImplicit: BenchCase[] = [
    ['implicit+named: user info',    'User: %(name)s (%(age)d yrs)',       [{ name:'Thor', age:40 }]],
    ['implicit+named: stats',        'Visits: %(v)d, Score: %(s)f',        [{ v:987, s:4.56 }]],
    ['implicit+named: mixed',        '%(x)s %d %j',                      [{ x:'X' }, 5, { y:6 }]],
]

export const complexNamedExplicit: BenchCase[] = [
    ['explicit+named: user info',    'User: %1$(name)s (%1$(age)d yrs)',   [{ name:'Thor', age:40 }]],
    ['explicit+named: stats',        'Visits: %1$(v)d, Score: %1$(s)f',    [{ v:987, s:4.56 }]],
    ['explicit+named: mixed',        '%1$(x)s %2$d %3$j',                 [{ x:'X' }, 5, { y:6 }]],
]

export const mixedCases: BenchCase[] = [
    ['implicit simple',   'Hi %s!',                      ['world']],
    ['explicit simple',   'Hi %1$s!',                    ['world']],
    ['complex imp',       'Val: %-8s %+06.2f',           ['ok', 7.89]],
    ['complex exp',       'Val: %1$-8s %2$+06.2f',        ['ok', 7.89]],
    ['named imp',         'User: %(u)s visits %(v)d',    [{ u:'A', v:3 }]],
    ['named exp',         'User: %1$(u)s visits %2$(v)d',[{ u:'A' }, { v:3 }]],
    ['mixed all',         '%2$d %%(literal) %1$s %j',     ['hey', 99, { literal:'%' }, { x:1 }]],
]
