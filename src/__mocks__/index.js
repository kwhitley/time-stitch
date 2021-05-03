const now = (new Date()).setMilliseconds(0)

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
