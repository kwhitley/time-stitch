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

  add(incoming = [], ...args) {
    // cache bust
    this._sorted = undefined

    // allows n args (sends each independently to this.add)
    if (args.length) {
      this.add(incoming)

      for (const arg of args) {
        this.add(arg)
      }

      return this
    }

    const seg = incoming instanceof Segment
                ? incoming
                : new Segment(incoming)

    const intersections = [...this].filter(s => s.intersects(seg))

    if (intersections.length === 0) {
      super.add(seg)

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

    return this
  }

  // returns segments cropped between start+end
  clone(options = {}) {
    const segments = [...this].map(s => s.clone(options)).filter(s => s) // crop and filter segments

    return new Timeline(...segments)
  }

  // return true if single segment from start to finish
  get isContinuous() {
    return this.size === 1
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

  // returns start of all segments
  get start() {
    const segs = [...this]

    return segs.length
            ? segs.map(s => s.start).reduce((lowest, v) => v < lowest ? v : lowest, Infinity)
            : undefined
  }

  get sorted() {
    if (this._sorted) return this._sorted

    return (this._sorted = [...this].sort((a, b) => a.start > b.start ? 1 : -1))
  }

  get values() {
    return this.sorted.map(s => s.sorted).flat()
  }
}

module.exports = {
  Timeline
}
