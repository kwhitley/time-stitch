const itemsA = [
  { date: new Date() - 10000, value: 'foo' },
  { date: new Date() - 9000, value: 'bar' },
  { date: new Date() - 8000, value: 'baz' },
]

const itemsB = [
  { date: new Date() - 12000, value: 'cat' },
  { date: new Date() - 11000, value: 'dog' },
  { date: new Date() - 10000, value: 'egg' },
]

const itemsOutside = [
  { date: new Date() - 6000, value: 'x' },
  { date: new Date() - 5500, value: 'y' },
  { date: new Date() - 5000, value: 'z' },
]

const itemsAround = [
  { date: new Date() - 100, value: 'omega' },
  { date: new Date() - 20000, value: 'alpha' },
]

const itemsInside = [
  { date: new Date() - 9500, value: 'a' },
  { date: new Date() - 8500, value: 'b' },
]

const itemsBridge = [
  { date: new Date() - 8500, value: 'm' },
  { date: new Date() - 5800, value: 'n' },
]

module.exports = {
  itemsA,
  itemsB,
  itemsOutside,
  itemsAround,
  itemsInside,
  itemsBridge,
}
