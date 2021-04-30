const { Segment } = require('./Segment')

class Timeline extends Set {
  constructor(options = {}) {
    super()
    this.period = options.period

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
    for (var i of intersections) {
      first.add(i)
      this.delete(i)
    }

    return this
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

  // returns start of all segments
  get start() {
    const segs = [...this]

    return segs.length
            ? segs.map(s => s.start).reduce((lowest, v) => v < lowest ? v : lowest, Infinity)
            : undefined
  }

  get sorted() {
    if (this._sorted) return this._sorted

    return this._sorted = [...this].sort((a, b) => a.start > b.start ? 1 : -1)
  }
}

module.exports = {
  Timeline
}
