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
        Object.assign(this, { ...arg }) // explode options into base object
      }
    }

    return this
  }

  // returns Timeline of gaps as segments
  get gaps() {
    const timeline = new Timeline()
    const sorted = [...this.sorted]

    if (!sorted.length) {
      timeline.add({ start: this.start, end: this.end })
    } else if (this.start < sorted[0].start) {
      timeline.add({ start: this.start, end: sorted[0].start })
    }

    while (sorted.length > 1) {
      const a = sorted.shift()
      const b = sorted[0]

      timeline.add(new Segment({ start: a.end, end: b.start }))
    }

    if (sorted.length && sorted[sorted.length-1].end < this.end) {
      timeline.add({ start: sorted[sorted.length-1].end, end: this.end })
    }

    return timeline
  }

  // return true if single segment from start to finish
  get isContinuous() {
    return this.size === 1
  }

  // returns segments, sorted by start date
  get sorted() {
    if (this._sorted && this._sorted.length === this.size) return this._sorted

    return (this._sorted = [...this].sort((a, b) => a.start > b.start ? 1 : -1))
  }

  // returns array values of all segments
  get values() {
    const raw = this.sorted.map(s => s.sorted).flat()

    if (!this.every || !this.start || !this.end) return raw

    let date = Number(this.start)
    let end = Number(this.end)
    let values = []
    let cursor = raw.shift()

    while (date < end) {
      date += this.every

      if (cursor && cursor.date <= date) {
        values.push(cursor)
        cursor = raw.shift()
      } else {
        values.push({ date: new Date(date) })
      }
    }

    return values
  }

  // add segments to timeline
  add(...args) {
    const incoming = args.shift()
    const seg = incoming instanceof Segment
                ? incoming
                : new Segment(incoming)

    // adjust bounds as needed
    this.start = new Date(Math.min(incoming.start, this.start || Infinity))
    this.end = new Date(Math.max(incoming.end, this.end || -Infinity))

    // find possible intersections
    const intersections = [...this.sorted].filter(s => s.intersects(seg))

    if (!intersections.length) {
      super.add(seg)
    } else {
      const first = intersections.shift()

      // otherwise merge intersecting
      first.add(seg)

      // merge other intersections into first and remove them from set
      for (const i of intersections) {
        first.add(i)
        this.delete(i)
      }
    }

    this._sorted = undefined

    return args.length
    ? this.add(...args)
    : this
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
