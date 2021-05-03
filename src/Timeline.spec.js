const { Segment } = require('./Segment')
const { Timeline } = require('./Timeline')
const mock = require('./__mocks__')

describe('Timeline:Set', () => {
  describe('constructor(seg1, seg2, ..., options?: object)', () => {
    it('adds segments to timeline', () => {
      const original = new Segment(mock.itemsA)
      const outside = new Segment(mock.outside)

      const timeline = new Timeline(original, outside)

      expect(timeline.size).toBe(2)
    })
  })

  describe('.end: boolean', () => {
    it('returns end of last (ordered) segment', () => {
      const late = new Segment(mock.itemsOutside)
      const early = new Segment(mock.itemsA)

      const timeline = new Timeline()
      timeline.add(late, early)

      expect(timeline.end).toBe(late.end)
    })
  })

  describe('.gaps: Timeline', () => {
    const a = new Segment(mock.itemsA)
    const b = new Segment(mock.itemsOutside)

    it('returns gaps within a timeline (as a new Timeline)', () => {
      const timeline = new Timeline(a, b)
      const gaps = timeline.gaps

      const gap = [...gaps][0]

      expect(gaps.size).toBe(1)
      expect(gap.start).toBe(a.end)
      expect(gap.end).toBe(b.start)
    })
  })

  describe('.start: boolean', () => {
    it('returns start of first (ordered) segment', () => {
      const late = new Segment(mock.itemsOutside)
      const early = new Segment(mock.itemsA)

      const timeline = new Timeline()
      timeline.add(late, early)

      expect(timeline.start).toBe(early.start)
    })
  })

  describe('.isContinuous: boolean', () => {
    it('returns true if single segment', () => {
      const original = new Segment(mock.itemsA)
      const timeline = new Timeline()
      timeline.add(original)

      expect(timeline.isContinuous).toBe(true)
    })

    it('returns false if multiple segments', () => {
      const original = new Segment(mock.itemsA)
      const outside = new Segment(mock.outside)
      const timeline = new Timeline()
      timeline
        .add(original)
        .add(outside)

      expect(timeline.isContinuous).toBe(false)
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    it('adds new segments', () => {
      const original = new Segment(mock.itemsA)
      const timeline = new Timeline()
      timeline.add(original)

      expect(timeline.size).toBe(1)
    })

    it('adds disconnected segments', () => {
      const original = new Segment(mock.itemsA)
      const outside = new Segment(mock.outside)
      const timeline = new Timeline()
      timeline
        .add(original)
        .add(outside)

      expect(timeline.size).toBe(2)
    })

    it('can accept raw data', () => {
      const timeline = new Timeline()
      timeline
        .add(mock.itemsA)
        .add(mock.outside)

      expect(timeline.size).toBe(2)
    })

    it('can accept multiple Segments or arrays of data', () => {
      const seg = new Segment(mock.outside)
      const timeline = new Timeline()
      timeline.add(mock.itemsA, seg)

      expect(timeline.size).toBe(2)
    })

    it('merges overlapping segments', () => {
      const original = new Segment(mock.itemsA)
      const overlap = new Segment(mock.itemsB)
      const timeline = new Timeline()
      timeline
        .add(original)
        .add(overlap)

      expect(timeline.size).toBe(1)
      expect(original.size).toBe(5)
    })

    it('merges overlapping segments', () => {
      const original = new Segment(mock.itemsA)
      const overlap = new Segment(mock.itemsB)
      const inside = new Segment(mock.itemsInside)
      const outside = new Segment(mock.itemsOutside)
      const timeline = new Timeline()
      timeline
        .add(original)
        .add(overlap)
        .add(inside)
        .add(outside)

      expect(timeline.size).toBe(2)
      expect(timeline.has(original)).toBe(true)
      expect(timeline.has(outside)).toBe(true)
      expect(timeline.has(inside)).toBe(false)
    })

    it('can bridge disconnected segments with an incoming segment that overlaps both', () => {
      const a = new Segment(mock.itemsA)
      const c = new Segment(mock.itemsOutside)
      const b = new Segment(mock.itemsBridge)

      const timeline = new Timeline(a, c)
      expect(timeline.size).toBe(2)

      timeline.add(b)
      expect(timeline.size).toBe(1)
    })
  })

  describe('.clone({ start: this.start, end: this.end }): Timeline', () => {
    const a = new Segment(mock.itemsA)
    const b = new Segment(mock.itemsOutside)

    it('returns undefined if no overlap', () => {
      const timeline = new Timeline(a)
      const cloned = timeline.clone(b)

      expect(cloned).toBe(undefined)
    })

    it('returns cloned Timeline if no params... .clone()', () => {
      const timeline = new Timeline(a, b)
      const cloned = timeline.clone()

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
    })

    it('returns cropped timeline (all segements)', () => {
      const start = new Date(mock.now - 9500)
      const end = new Date(mock.now - 5300)

      const timeline = new Timeline(a, b)
      const cloned = timeline.clone({ start, end })

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })

    it('returns cropped timeline (fewer segments)', () => {
      const start = new Date(mock.now - 7000)

      const timeline = new Timeline(a, b)
      const cloned = timeline.clone({ start })

      expect(cloned.size).toBe(1)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })
  })

  describe('.fill(...timelines: Timeline): Timeline', () => {
    const a = new Segment(mock.itemsA)
    const b = new Segment(mock.itemsOutside)
    const fillA = new Segment(mock.fillA)
    const fillB = new Segment(mock.fillB)
    const timeline = new Timeline(a, b)

    it('throws if not passed a valid Timeline', () => {
      expect(() => timeline.fill('foo')).toThrow()
    })

    it('can fill with a background timeline', () => {
      const filledPartial = timeline.fill(new Timeline(fillA))
      expect(filledPartial.size).toBe(2)
      expect(filledPartial.values.length).toBeGreaterThan(timeline.values.length)

      const filledComplete = timeline.fill(new Timeline(fillB), new Timeline(fillA)) // fill with 2 interior timelines
      expect(filledComplete.size).toBe(1)
    })
  })

  describe('.intersection(t: Timeline): Timeline', () => {
    const a = new Segment(mock.itemsA)
    const b = new Segment(mock.itemsOutside)
    const timeline = new Timeline(a, b)

    it('throws if not passed a valid Timeline', () => {
      expect(() => timeline.intersection('foo')).toThrow()
    })

    it('can intersect an interior timeline', () => {
      const start = new Date(mock.now - 9500)
      const end = new Date(mock.now - 5300)

      const seg = new Segment({ start, end })
      const interior = new Timeline(seg)
      const intersection = timeline.intersection(interior)

      expect(intersection.size).toBe(2)
      expect(intersection.values.length).toBe(4)
    })


    it('can intersect a more advanced, encompassing timeline', () => {
      const start = new Date(mock.now - 9500)
      const end = new Date(mock.now - 5300)

      const seg1 = new Segment({
        start: new Date(mock.now - 12000),
        end: new Date(mock.now - 9500),
      })

      const seg2 = new Segment({
        start: new Date(mock.now - 6800),
        end: new Date(mock.now - 4000),
      })

      const interior = new Timeline(seg1, seg2)
      const intersection = timeline.intersection(interior)

      expect(intersection.size).toBe(2)
      expect(intersection.values.length).toBe(4)
    })
  })
})
