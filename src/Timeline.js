const { isBetween } = require('./utils/isBetween')
const { Segment } = require('./Segment')

class Timeline extends Set {
  constructor(...args) {
    super()

    // add any segments as args, then add config
    while (args.length) {
      const arg = args.shift()

      if (arg instanceof Segment) {
        this.add(arg)
      } else if (typeof arg === 'object') {
        this.options = arg
      }
    }

    return this
  }

  // returns end of all segments
  get end() {
    const segs = [...this]

    return segs.length
            ? segs.map(s => s.end).reduce((highest, v) => v > highest ? v : highest, -Infinity)
            : undefined
  }

  // returns Timeline of gaps as segments
  get gaps() {
    const timeline = new Timeline()
    const sorted = [...this.sorted]

    while (sorted.length > 1) {
      const a = sorted.shift()
      const b = sorted[0]

      timeline.add(new Segment({ start: a.end, end: b.start }))
    }

    return timeline
  }

  // return true if single segment from start to finish
  get isContinuous() {
    return this.size === 1
  }

  // returns start of all segments
  get start() {
    const segs = [...this]

    return segs.length
            ? segs.map(s => s.start).reduce((lowest, v) => v < lowest ? v : lowest, Infinity)
            : undefined
  }

  // returns segments, sorted by start date
  get sorted() {
    if (this._sorted && this._sorted.length === this.size) return this._sorted

    return (this._sorted = [...this].sort((a, b) => a.start > b.start ? 1 : -1))
  }

  // returns array values of all segments
  get values() {
    return this.sorted.map(s => s.sorted).flat()
  }

  // add segments to timeline
  add(incoming = [], ...args) {
    // cache bust
    // allows n args (sends each independently to this.add)
    if (args.length) {
      this.add(incoming)

      for (const arg of args) {
        this.add(arg)
      }

      this._sorted = undefined

      return this
    }

    const seg = incoming instanceof Segment
                ? incoming
                : new Segment(incoming)

    const intersections = [...this.sorted].filter(s => s.intersects(seg))

    if (intersections.length === 0) {
      super.add(seg)
      this._sorted = undefined

      return this
    }

    const first = intersections.shift()

    // otherwise merge intersecting
    first.add(seg)

    // merge other intersections into first and remove them from set
    for (const i of intersections) {
      first.add(i)
      this.delete(i)
    }

    this._sorted = undefined

    return this
  }

  // returns segments cropped between start+end
  clone(options = {}) {
    const segments = [...this].map(s => s.clone(options)).filter(s => s) // crop and filter segments

    return segments.length
            ? new Timeline(...segments)
            : undefined
  }

  // clones this timeline, then returns a version filled with other timeline layers
  fill(...timelines) {
    const base = this.clone()

    while (!this.isContinuous && timelines.length) {
      const t = timelines.shift()
      if (!(t instanceof Timeline)) {
        throw new TypeError('Timeline.fill(...timelines) must be passed type Timelines')
      }

      const gaps = base.gaps
      const fill = t.intersection(gaps) // fill from the intersection of incoming timeline and gaps in this one

      for (const s of [...fill]) {
        base.add(s)
      }
    }

    return base
  }

  // returns the intersection of two timelines
  intersection(timeline) {
    if (!(timeline instanceof Timeline)) {
      throw new TypeError('Timeline.intersection(Timeline) requires a Timeline argument')
    }

    const t1 = this.sorted
    const t2 = timeline.sorted
    const intersections = []

    // shortuct if either timeline is empty
    if (t2.size < 1 || t1.size < 1) return undefined

    let a = t1.shift()
    let b = t2.shift()

    while (a && b) {
      const intersection = a.intersection(b)

      if (intersection) {
        intersections.push(intersection)
      }

      if (a.end < b.end) {
        a = t1.shift()
      } else {
        b = t2.shift()
      }
    }

    return intersections.length
    ? new Timeline(...intersections)
    : undefined
  }
}

module.exports = {
  Timeline
}
