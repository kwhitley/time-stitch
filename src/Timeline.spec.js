const { Segment } = require('./Segment')
const { Timeline } = require('./Timeline')
const data = require('./__mocks__')

describe('Timeline:Set', () => {
  const a = new Segment(data.a)
  const b = new Segment(data.b)
  const b2 = new Segment(data.b2)
  const c = new Segment(data.c)
  const d = new Segment(data.d)
  const d2 = new Segment(data.d2)
  const e = new Segment(data.e)
  const full = new Segment(data.full)

  describe('constructor(seg1, seg2, ..., options?: object)', () => {
    it('adds segments to timeline', () => {
      const timeline = new Timeline(a, c)

      expect(timeline.size).toBe(2)
    })
  })

  describe('.end: boolean', () => {
    it('returns end of last (ordered) segment', () => {
      const timeline = new Timeline(c, a)

      expect(timeline.end).toBe(c.end)
    })
  })

  describe('.gaps: Timeline', () => {
    it('returns gaps within a timeline (as a new Timeline)', () => {
      const timeline = new Timeline(a, c, e)
      const gaps = timeline.gaps

      const gap1 = [...gaps][0]
      const gap2 = [...gaps][1]

      expect(gaps.size).toBe(2)
      expect(gap1.start).toBe(a.end)
      expect(gap1.end).toBe(c.start)
      expect(gap2.start).toBe(c.end)
      expect(gap2.end).toBe(e.start)
    })
  })

  describe('.start: boolean', () => {
    it('returns start of first (ordered) segment', () => {
      const timeline = new Timeline(c, a)

      expect(timeline.start).toBe(a.start)
    })
  })

  describe('.isContinuous: boolean', () => {
    it('returns true if single segment', () => {
      const timeline = new Timeline(a.clone(), b.clone(), c.clone()) // clone to prevent mutating

      expect(timeline.isContinuous).toBe(true)
    })

    it('returns false if multiple segments', () => {
      const timeline = new Timeline(a, c)

      expect(timeline.isContinuous).toBe(false)
    })
  })

  describe('.add(items: object[] | Segment): this', () => {
    it('adds new segments', () => {
      const timeline = new Timeline()
      timeline.add(a)
      expect(timeline.size).toBe(1)

      timeline.add(c)
      expect(timeline.size).toBe(2)
    })

    it('adds disconnected segments', () => {
      const timeline = new Timeline(a)
      timeline.add(c)

      expect(timeline.size).toBe(2)
    })

    it('can accept raw data', () => {
      const timeline = new Timeline()
      timeline
        .add(data.a)
        .add(data.c)

      expect(timeline.size).toBe(2)
    })

    it('can accept multiple Segments or arrays of data', () => {
      const timeline = new Timeline()
      timeline.add(a, c)

      expect(timeline.size).toBe(2)
    })

    it('merges overlapping segments', () => {
      const timeline = new Timeline(a.clone(), b.clone())

      expect(timeline.size).toBe(1)
    })

    it('merges overlapping segments', () => {
      const timeline = new Timeline(a.clone(), c.clone(), e.clone())
      expect(timeline.size).toBe(3)

      timeline.add(d.clone())
      expect(timeline.size).toBe(2)
    })

    it('merges overlapping segments', () => {
      const timeline = new Timeline(a.clone(), b.clone(), c.clone(), e)

      expect(timeline.size).toBe(2)
      expect(timeline.has(e)).toBe(true)
    })

    it('can bridge disconnected segments with an incoming segment that overlaps both', () => {
      const timeline = new Timeline(a.clone(), c)
      expect(timeline.size).toBe(2)

      timeline.add(b)
      expect(timeline.size).toBe(1)
    })
  })

  describe('.clone({ start: this.start, end: this.end }): Timeline', () => {
    it('returns undefined if no overlap', () => {
      const timeline = new Timeline(a)
      const cloned = timeline.clone(c)

      expect(cloned).toBe(undefined)
    })

    it('returns cloned Timeline if no params... .clone()', () => {
      const timeline = new Timeline(a, c)
      const cloned = timeline.clone()

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
    })

    it('returns cropped timeline (all segements)', () => {
      const timeline = new Timeline(a, c)
      const cloned = timeline.clone(b)

      expect(timeline.size).toBe(cloned.size)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })

    it('returns cropped timeline (fewer segments)', () => {
      const timeline = new Timeline(a, c)
      const cloned = timeline.clone(d)

      expect(cloned.size).toBe(1)
      expect(timeline).not.toBe(cloned)
      expect(timeline.values.length).toBeGreaterThan(cloned.values.length)
    })
  })

  describe('.fill(...timelines: Timeline): Timeline', () => {
    const timeline = new Timeline(a, c, e)

    it('throws if not passed a valid Timeline', () => {
      expect(() => timeline.fill('foo')).toThrow()
    })

    it('can fill with a background timeline', () => {
      const filledPartial = timeline.fill(new Timeline(d))
      expect(filledPartial.size).toBe(2)

      const filledComplete = timeline.fill(new Timeline(b), new Timeline(d)) // fill with 2 interior timelines
      expect(filledComplete.size).toBe(1)
    })

    it('can fill with multiple timelines', () => {
      const partial1 = new Timeline(b2, d2)
      const partial2 = new Timeline(b, d)
      const filledPartial = timeline.fill(partial1)
      expect(filledPartial.size).toBe(3)

      const filledComplete = timeline.fill(partial1, partial2)
      expect(filledComplete.size).toBe(1)

      const values = filledComplete.values.reduce((set, r) => set.add(r.source), new Set)
      expect(values.size).toBe(7)
    })
  })

  describe('.intersection(t: Timeline): Timeline', () => {
    const timeline = new Timeline(a, c)

    it('throws if not passed a valid Timeline', () => {
      expect(() => timeline.intersection('foo')).toThrow()
    })

    it('can intersect an overlapping timeline', () => {
      const interior = new Timeline(b)
      const intersection = timeline.intersection(interior)

      expect(intersection.size).toBe(2)
    })

    it('can intersect a timeline at the end', () => {
      const tail = new Timeline(d)
      const intersection = timeline.intersection(tail)

      expect(intersection.size).toBe(1)
    })

    it('ACE + BD = 4 intersections', () => {
      const complete = new Timeline(full)
      const ace = new Timeline(a, c, e)
      const bd = new Timeline(b, d)
      const intersection = ace.intersection(bd)

      expect(intersection.size).toBe(4)
    })

    it('ACE + FULL = 3 intersections', () => {
      const complete = new Timeline(full)
      const ace = new Timeline(a, c, e)
      const intersection = ace.intersection(complete)

      expect(intersection.size).toBe(3)
    })
  })
})
