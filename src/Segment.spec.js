const { Segment } = require('./Segment')
const mock = require('./__mocks__')
const { a, b, c, d, e, full } = mock

describe('Segment:Map', () => {
  describe('constructor(items: object[] | config: object)', () => {
    it('correctly adds items to internal Map', () => {
      const seg = new Segment(a)

      expect(seg.size).toBe(a.length)
    })

    it('equivalent to .add(items) if array is passed', () => {
      const seg = new Segment()
      seg.add(a)

      expect(seg.size).toBe(a.length)
    })

    it('extends self if config is passed as object', () => {
      const start = new Date(mock.now - 1000)
      const end = mock.now
      const seg = new Segment({ start, end })

      expect(seg.start).toBe(start)
      expect(seg.end).toBe(end)
    })
  })

  describe('.duration: Date', () => {
    it('returns the difference (in ms) between end and start', () => {
      const start = new Date(mock.now - 1000)
      const end = mock.now
      const seg = new Segment({ start, end })

      expect(seg.duration).toBe(end - start)
    })
  })

  describe('.end: Date', () => {
    it('returns the max date in the segment (if first)', () => {
      const seg = new Segment(a)

      expect(Number(seg.end)).toBe(Math.max(...a.map(i => i.date)))
    })

    it('returns the max date in the segment (if last)', () => {
      const reversed = [...a].reverse()
      const seg = new Segment(reversed)

      expect(Number(seg.end)).toBe(Math.max(...reversed.map(i => i.date)))
    })
  })

  describe('.start: Date', () => {
    it('returns the min date in the segment (assuming first or last value)', () => {
      const seg = new Segment(a)

      expect(Number(seg.start)).toBe(Math.min(...a.map(i => i.date)))
    })

    it('returns the min date in the segment (if last)', () => {
      const reversed = [...a].reverse()
      const seg = new Segment(reversed)

      expect(Number(seg.start)).toBe(Math.min(...reversed.map(i => i.date)))
    })
  })

  describe('.sorted: object[]', () => {
    it('returns a sorted array of entries', () => {
      const reversed = [...a].reverse()
      const seg = new Segment(reversed)

      expect(Array.isArray(seg.sorted)).toBe(true)
      expect(seg.sorted.length).toBe(reversed.length)
      expect(Number(seg.sorted[0].date)).toBeLessThan(Number(seg.sorted[seg.sorted.length-1].date))
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    const seg = new Segment(a)
    seg.add(full)

    it('adds new unique (by date) items', () => {
      expect(seg.size).toBeGreaterThan(a.length)
    })

    it('shifts the start', () => {
      expect(Number(seg.start)).toBe(Math.min(...full.map(i => i.date)))
    })

    it('shifts the end', () => {
      expect(Number(seg.end)).toBe(Math.max(...full.map(i => i.date)))
    })

    it('can accept another Segment', () => {
      const seg = new Segment(a)
      const segB = new Segment(b)

      seg.add(segB)

      expect(seg.size).toBeGreaterThan(a.length)
    })
  })

  describe('.clone({ start: this.start, end: this.end }): Segment|undefined', () => {
    const segA = new Segment(a)

    it('returns undefined if no overlap', () => {
      const outside = new Segment(c)
      const start = outside.start
      const end = outside.end

      const cropped = segA.clone({ start, end })

      expect(cropped).toBe(undefined)
    })

    it('uses segment start+end as defaults', () => {
      const cropped = segA.clone()

      expect(cropped.size).toBe(a.length)
      expect(segA).not.toBe(cropped)
    })

    it('returns new Segment cropped to bounds (and uses current start+end as defaults)', () => {
      const start = Number(segA.start) + 3000
      const cropped = segA.clone({ start })

      expect(segA.size).toBe(a.length)
      expect(segA).not.toEqual(cropped)
      expect(cropped.size).toBeLessThan(a.length)
    })
  })

  describe('.contains(date): boolean', () => {
    const seg = new Segment(a)

    it('returns true if date is within start-end', () => {
      const target = new Date(Number(seg.start) + 10)

      expect(seg.contains(target)).toBe(true)
    })

    it('returns false if date is not within start-end', () => {
      const target = seg.start - 1000

      expect(seg.contains(target)).toBe(false)
    })
  })

  describe('.intersection(segment: Segment): boolean', () => {
    const segA = new Segment(a)
    const segB = new Segment(b)
    const segC = new Segment(c)
    const segD = new Segment(d)
    const segE = new Segment(e)
    const segFull = new Segment(full)

    it('throws if not passed a Segment', () => {
      expect(() => segA.intersection('fail')).toThrow()
    })

    it('returns undefined if no overlap', () => {
      expect(segA.intersection(segC)).toBe(undefined)
    })

    it('returns segment if overlaps/adjacent', () => {
      const intersection = segA.intersection(segB)

      expect(intersection instanceof Segment).toBe(true)
      expect(intersection.start).toEqual(segB.start)
      expect(intersection.end).toEqual(segA.end)
    })
  })

  describe('.intersects(segment: Segment): boolean', () => {
    const segA = new Segment(a)
    const segB = new Segment(b)
    const segC = new Segment(c)
    const segD = new Segment(d)
    const segE = new Segment(e)
    const segFull = new Segment(full)

    it('throws if not passed a Segment', () => {
      expect(() => segA.intersects('fail')).toThrow()
    })

    it('returns false if no overlap', () => {
      expect(segA.intersects(segC)).toBe(false)
    })

    it('returns true if overlaps/adjacent', () => {
      expect(segA.intersects(segB)).toBe(true)
    })

    it('returns true if incoming segment wraps this', () => {
      expect(segA.intersects(segFull)).toBe(true)
    })

    it('returns true if incoming segment is within this', () => {
      expect(segFull.intersects(segA)).toBe(true)
    })
  })
})
