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

    it('returns cloned Timeline if no params... .clone()', () => {
      const timeline = new Timeline(a, b)
      const cloned = timeline.clone()

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
    })

    it('returns cropped timeline (all segements)', () => {
      const start = new Date(new Date() - 9500)
      const end = new Date(new Date() - 5300)

      const timeline = new Timeline(a, b)
      const cloned = timeline.clone({ start, end })

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })

    it('returns cropped timeline (fewer segments)', () => {
      const start = new Date(new Date() - 7000)

      const timeline = new Timeline(a, b)
      const cloned = timeline.clone({ start })

      expect(cloned.size).toBe(1)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })
  })
})
