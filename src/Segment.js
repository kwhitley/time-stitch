const { isBetween } = require('./utils/isBetween')

const getDate = item => new Date(item ? (item.timestamp || item.date) : undefined)

class Segment extends Map {
  constructor(incoming = []) {
    super()

    if (Array.isArray(incoming)) {
      this.add(incoming)
    } else if (typeof incoming === 'object') {
      Object.assign(this, incoming)
    }
  }

  // add more entries to the segment
  add(incoming = []) {
    let min = incoming.start
    let max = incoming.end

    if (!(incoming instanceof Segment)) {
      min = Math.min(getDate(incoming[0]) || 0, getDate(incoming[incoming.length-1]) || 0)
      max = Math.max(getDate(incoming[0]) || 0, getDate(incoming[incoming.length-1]) || 0)
    } else {
      incoming = [...incoming].map(i => i[1]) // get plain values for merging
    }

    for (const entry of incoming) {
      let { date, timestamp, ...other } = entry
      date = Number(date || timestamp)

      // unify data { date, ...other }
      this.set(date, { date: new Date(date), ...other })
    }

    // move endpoints
    this.start = new Date(Math.min(min, this.start || Infinity))
    this.end = new Date(Math.max(max, this.end || -Infinity))

    // invalidate cache
    this._sorted = undefined

    return this
  }

  // returns new Segment cropped between start & end
  clone(options = {}) {
    const {
      start = -Infinity,
      end = Infinity,
    } = options
    const within = isBetween(this.start, this.end)
    const withinTarget = isBetween(start, end)

    if (within(start) || within(end)) {
      const values = [...this].filter(i => withinTarget(i[0])).map(i => i[1]) // inefficient

      return new Segment(values)
    } else if (withinTarget(this.start)) {
      return new Segment(this.sorted)
    }

    return undefined
  }

  // returns true|false if date is contained within time segment
  contains(date) {
    return isBetween(this.start, this.end)(date)
  }

  // returns true|false if this intersects incoming segment
  intersection(segment) {
    if (!(segment instanceof Segment)) {
      throw new TypeError('Segment.intersects(segment) requires a Segment argument')
    }

    const start = Math.max(this.start, segment.start)
    const end = Math.min(this.end, segment.end)

    if (end > start) {
      return this.clone({ start, end })
    }

    return undefined
  }

  // returns true|false if this intersects incoming segment
  intersects(segment) {
    if (!(segment instanceof Segment)) {
      throw new TypeError('Segment.intersects(segment) requires a Segment argument')
    }

    const inside = isBetween(this.start, this.end)
    const { start, end } = segment

    return inside(start) || inside(end) || isBetween(start, end)(this.start)
  }

  // returns distance (in ms) between this.start and this.end
  get duration() {
    return this.end - this.start
  }

  // sorted getter, cached upon inquiry for memoization
  get sorted() {
    if (this._sorted) return this._sorted

    return (this._sorted = [...this].sort((a, b) => a[0] > b[0] ? 1 : -1).map(i => i[1]))
  }
}

module.exports = {
  Segment,
}
