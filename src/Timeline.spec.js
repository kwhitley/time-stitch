const { Segment } = require('./Segment')
const { Timeline } = require('./Timeline')
const mock = require('./Segment.spec')

describe('Segments:Set', () => {
  describe('constructor(items: object[])', () => {
    it('correctly adds items to internal Map', () => {
      const seg = new Segment(mock.itemsA)

      expect(seg.size).toBe(3)
    })

    it('equivalent to .add(items)', () => {
      const seg = new Segment()
      seg.add(mock.itemsA)

      expect(seg.size).toBe(3)
    })
  })

  describe('.end: boolean', () => {
    it('returns end of latest segment', () => {
      const late = new Segment(mock.itemsOutside)
      const early = new Segment(mock.itemsA)

      const timeline = new Timeline
      timeline.add(late, early)

      expect(timeline.end).toBe(late.end)
    })
  })

  describe('.start: boolean', () => {
    it('returns start of earliest segment', () => {
      const late = new Segment(mock.itemsOutside)
      const early = new Segment(mock.itemsA)

      const timeline = new Timeline
      timeline.add(late, early)

      expect(timeline.start).toBe(early.start)
    })
  })

  describe('.isContinuous: boolean', () => {
    it('returns true if single segment', () => {
      const original = new Segment(mock.itemsA)
      const timeline = new Timeline
      timeline.add(original)

      expect(timeline.isContinuous).toBe(true)
    })

    it('returns false if multiple segments', () => {
      const original = new Segment(mock.itemsA)
      const outside = new Segment(mock.outside)
      const timeline = new Timeline
      timeline
        .add(original)
        .add(outside)

      expect(timeline.isContinuous).toBe(false)
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    it('adds new segments', () => {
      const original = new Segment(mock.itemsA)
      const timeline = new Timeline
      timeline.add(original)

      expect(timeline.size).toBe(1)
    })

    it('adds disconnected segments', () => {
      const original = new Segment(mock.itemsA)
      const outside = new Segment(mock.outside)
      const timeline = new Timeline
      timeline
        .add(original)
        .add(outside)

      expect(timeline.size).toBe(2)
    })

    it('can accept raw data', () => {
      const timeline = new Timeline
      timeline
        .add(mock.itemsA)
        .add(mock.outside)

      expect(timeline.size).toBe(2)
    })

    it('can accept multiple Segments or arrays of data', () => {
      const seg = new Segment(mock.outside)
      const timeline = new Timeline
      timeline.add(mock.itemsA, seg)

      expect(timeline.size).toBe(2)
    })

    it('merges overlapping segments', () => {
      const original = new Segment(mock.itemsA)
      const overlap = new Segment(mock.itemsB)
      const timeline = new Timeline
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
      const timeline = new Timeline
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
  })
})
