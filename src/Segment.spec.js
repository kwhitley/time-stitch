const { Segment } = require('./Segment')

const itemsA = [
  { date: new Date - 10000, value: 'foo' },
  { date: new Date - 9000, value: 'bar' },
  { date: new Date - 8000, value: 'baz' },
]

const itemsB = [
  { date: new Date - 12000, value: 'cat' },
  { date: new Date - 10000, value: 'dog' },
  { date: new Date - 9500, value: 'egg' },
]

const itemsOutside = [
  { date: new Date - 6000, value: 'x' },
  { date: new Date - 5500, value: 'y' },
  { date: new Date - 5000, value: 'z' },
]

const itemsAround = [
  { date: new Date - 100, value: 'omega' },
  { date: new Date - 20000, value: 'alpha' },
]

const itemsInside = [
  { date: new Date - 9500, value: 'a' },
  { date: new Date - 8500, value: 'b' },
]

module.exports = {
  itemsA,
  itemsB,
  itemsOutside,
  itemsAround,
  itemsInside,
}

const itemsAreversed = [...itemsA].reverse()
const itemsBreversed = [...itemsB].reverse()

describe('Segment:Map', () => {
  describe('constructor(items: object[])', () => {
    it('correctly adds items to internal Map', () => {
      const seg = new Segment(itemsA)

      expect(seg.size).toBe(3)
    })

    it('equivalent to .add(items)', () => {
      const seg = new Segment()
      seg.add(itemsA)

      expect(seg.size).toBe(3)
    })
  })

  describe('.end: Date', () => {
    it('returns the max date in the segment (if first)', () => {
      const seg = new Segment(itemsA)

      expect(+seg.end).toBe(Math.max(...itemsA.map(i => i.date)))
    })

    it('returns the max date in the segment (if last)', () => {
      const seg = new Segment(itemsAreversed)

      expect(+seg.end).toBe(Math.max(...itemsAreversed.map(i => i.date)))
    })
  })

  describe('.start: Date', () => {
    it('returns the min date in the segment (assuming first or last value)', () => {
      const seg = new Segment(itemsA)

      expect(+seg.start).toBe(Math.min(...itemsA.map(i => i.date)))
    })

    it('returns the min date in the segment (if last)', () => {
      const seg = new Segment(itemsAreversed)

      expect(+seg.start).toBe(Math.min(...itemsAreversed.map(i => i.date)))
    })
  })

  describe('.sorted: object[]', () => {
    it('returns a sorted array of entries', () => {
      const seg = new Segment(itemsAreversed)

      expect(Array.isArray(seg.sorted)).toBe(true)
      expect(seg.sorted.length).toBe(itemsAreversed.length)
      expect(+seg.sorted[0].date).toBeLessThan(+seg.sorted[seg.sorted.length-1].date)
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    const seg = new Segment(itemsA)
    seg.add(itemsB)

    it('adds new unique (by date) items', () => {
      expect(seg.size).toBe(5)
    })

    it('shifts the start', () => {
      expect(+seg.start).toBe(Math.min(...itemsB.map(i => i.date)))
    })

    it('shifts the end', () => {
      expect(+seg.end).toBe(Math.max(...itemsA.map(i => i.date)))
    })

    it('can accept another Segment', () => {
      const seg = new Segment(itemsA)
      const segB = new Segment(itemsB)

      seg.add(segB)

      expect(seg.size).toBe(5)
    })
  })

  describe('.intersects(segment: Segment): boolean', () => {
    const seg = new Segment(itemsA)
    const outside = new Segment(itemsOutside)
    const crosses = new Segment(itemsB)
    const inside = new Segment(itemsInside)
    const around = new Segment(itemsAround)

    it('throws if not passed a Segment', () => {
      expect(() => seg.intersects('fail')).toThrow()
    })

    it('returns false if no overlap', () => {
      expect(seg.intersects(outside)).toBe(false)
    })

    it('returns true if overlaps', () => {
      expect(seg.intersects(crosses)).toBe(true)
    })

    it('returns true if incoming segment wraps this', () => {
      expect(seg.intersects(around)).toBe(true)
    })

    it('returns true if incoming segment wraps this', () => {
      expect(seg.intersects(inside)).toBe(true)
    })
  })
})
