const now = (new Date()).setMilliseconds(0)

/*

SEGMENTS

a       mmmmmmmmm
b               mmmmmmmmm
b2                  mmmmm
c                       mmmmmmmmm
d                               mmmmmmmmmm
d2                                   mmmmm
e                                       mmmmmmmmmm
full mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm

*/

const points = 100
const len = points / 7
const overlap = 1
const full = Array(points)
              .fill(0)
              .map((v, i) => new Date(new Date() - 1000 * i))
              .reverse()
              .map(v => new Date(v.setMilliseconds(0)))
const getSlice = (arr, len) => (start, letter) => full.slice(start - overlap, start + len + overlap * 2).map(date => ({ date, source: letter }))
const getSegment = getSlice(full, len)

// first segment is
const segments = { full: full.map(date => ({ date, source: 'full' })) }

'abcde'.split('').reduce((acc, letter, index) => {
  acc[letter] = getSegment((index + 1) * len, letter)

  return acc
}, segments)

// console.log({ segments })

segments.b2 = segments.b.slice(segments.b.length / 2).map(i => ({ ...i, source: 'b2' }))
segments.d2 = segments.d.slice(segments.d.length / 2).map(i => ({ ...i, source: 'd2' }))

const itemsA = [
  { date: now - 10000, value: 'foo' },
  { date: now - 9000, value: 'bar' },
  { date: now - 8000, value: 'baz' },
]

const itemsB = [
  { date: now - 12000, value: 'cat' },
  { date: now - 11000, value: 'dog' },
  { date: now - 10000, value: 'egg' },
]

const itemsOutside = [
  { date: now - 6000, value: 'x' },
  { date: now - 5500, value: 'y' },
  { date: now - 5000, value: 'z' },
]

const itemsAround = [
  { date: now - 100, value: 'omega' },
  { date: now - 20000, value: 'alpha' },
]

const itemsInside = [
  { date: now - 9500, value: 'a' },
  { date: now - 8500, value: 'b' },
]

const itemsBridge = [
  { date: now - 8500, value: 'm' },
  { date: now - 5800, value: 'n' },
]

const fillA = Array(1000)
                .fill(0)
                .map((v, i) => ({ date: now - 7000 - i * 100, value: -i }))

const fillB = Array(10000)
                .fill(0)
                .map((v, i) => ({ date: now - 7000 + i * 10, value: i }))

module.exports = {
  ...segments,
  now,
  fillA,
  fillB,
  itemsA,
  itemsB,
  itemsOutside,
  itemsAround,
  itemsInside,
  itemsBridge,
}
