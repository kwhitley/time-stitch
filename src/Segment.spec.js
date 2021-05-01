const { Segment } = require('./Segment')
const mock = require('./__mocks__')

const itemsAreversed = [...mock.itemsA].reverse()
const itemsBreversed = [...mock.itemsB].reverse()

describe('Segment:Map', () => {
  describe('constructor(items: object[] | config: object)', () => {
    it('correctly adds items to internal Map', () => {
      const seg = new Segment(mock.itemsA)

      expect(seg.size).toBe(3)
    })

    it('equivalent to .add(items) if array is passed', () => {
      const seg = new Segment()
      seg.add(mock.itemsA)

      expect(seg.size).toBe(3)
    })

    it('extends self if config is passed as object', () => {
      const start = new Date(new Date() - 1000)
      const end = new Date()
      const seg = new Segment({ start, end })

      expect(seg.start).toBe(start)
      expect(seg.end).toBe(end)
    })
  })

  describe('.duration: Date', () => {
    it('returns the difference (in ms) between end and start', () => {
      const start = new Date(new Date() - 1000)
      const end = new Date()
      const seg = new Segment({ start, end })

      expect(seg.duration).toBe(end - start)
    })
  })

  describe('.end: Date', () => {
    it('returns the max date in the segment (if first)', () => {
      const seg = new Segment(mock.itemsA)

      expect(Number(seg.end)).toBe(Math.max(...mock.itemsA.map(i => i.date)))
    })

    it('returns the max date in the segment (if last)', () => {
      const seg = new Segment(itemsAreversed)

      expect(Number(seg.end)).toBe(Math.max(...itemsAreversed.map(i => i.date)))
    })
  })

  describe('.start: Date', () => {
    it('returns the min date in the segment (assuming first or last value)', () => {
      const seg = new Segment(mock.itemsA)

      expect(Number(seg.start)).toBe(Math.min(...mock.itemsA.map(i => i.date)))
    })

    it('returns the min date in the segment (if last)', () => {
      const seg = new Segment(itemsAreversed)

      expect(Number(seg.start)).toBe(Math.min(...itemsAreversed.map(i => i.date)))
    })
  })

  describe('.sorted: object[]', () => {
    it('returns a sorted array of entries', () => {
      const seg = new Segment(itemsAreversed)

      expect(Array.isArray(seg.sorted)).toBe(true)
      expect(seg.sorted.length).toBe(itemsAreversed.length)
      expect(Number(seg.sorted[0].date)).toBeLessThan(Number(seg.sorted[seg.sorted.length-1].date))
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    const seg = new Segment(mock.itemsA)
    seg.add(mock.itemsB)

    it('adds new unique (by date) items', () => {
      expect(seg.size).toBe(5)
    })

    it('shifts the start', () => {
      expect(Number(seg.start)).toBe(Math.min(...mock.itemsB.map(i => i.date)))
    })

    it('shifts the end', () => {
      expect(Number(seg.end)).toBe(Math.max(...mock.itemsA.map(i => i.date)))
    })

    it('can accept another Segment', () => {
      const seg = new Segment(mock.itemsA)
      const segB = new Segment(mock.itemsB)

      seg.add(segB)

      expect(seg.size).toBe(5)
    })
  })

  describe('.clone({ start: this.start, end: this.end }): Segment|undefined', () => {
    it('returns undefined if no overlap', () => {
      const seg = new Segment(mock.itemsA)
      const start = new Date(Number(new Date()) + 20000)
      const end = new Date(Number(start) + 20000)

      const cropped = seg.clone({ start, end })

      expect(cropped).toBe(undefined)
    })

    it('uses segment start+end as defaults', () => {
      const seg = new Segment(mock.itemsA)
      const cropped = seg.clone()

      expect(cropped.size).toBe(mock.itemsA.length)
      expect(seg).not.toBe(cropped)
    })

    it('returns new Segment cropped to bounds (and uses current start+end as defaults)', () => {
      const seg = new Segment(mock.itemsA)
      const start = new Date(new Date() - 9500)

      const cropped = seg.clone({ start })

      expect(seg.size).toBe(mock.itemsA.length)
      expect(seg).not.toEqual(cropped)
      expect(cropped.size).toBe(mock.itemsA.length - 1)
    })

    it('returns undefined when no overlap', () => {
      const start = new Date(new Date() - 7000)

      const seg = new Segment(mock.itemsA)
      const cloned = seg.clone({ start })

      expect(cloned).toBe(undefined)
    })
  })

  describe('.contains(date): boolean', () => {
    const seg = new Segment(mock.itemsA)

    it('returns true if date is within start-end', () => {
      const target = new Date(Number(seg.start) + 10)

      expect(seg.contains(target)).toBe(true)
    })

    it('returns false if date is not within start-end', () => {
      const target = seg.start - 1000

      expect(seg.contains(target)).toBe(false)
    })
  })

  describe('.intersects(segment: Segment): boolean', () => {
    const seg = new Segment(mock.itemsA)
    const outside = new Segment(mock.itemsOutside)
    const crosses = new Segment(mock.itemsB)
    const inside = new Segment(mock.itemsInside)
    const around = new Segment(mock.itemsAround)

    it('throws if not passed a Segment', () => {
      expect(() => seg.intersects('fail')).toThrow()
    })

    it('returns false if no overlap', () => {
      expect(seg.intersects(outside)).toBe(false)
    })

    it('returns true if overlaps/adjacent', () => {
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
