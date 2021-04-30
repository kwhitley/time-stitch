const getDate = item => new Date(item ? (item.timestamp || item.date) : undefined)

const isBetween = (a, b) => c => Boolean(a<c&c<b)

class Segment extends Map {
  constructor(incoming = []) {
    super()
    this.add(incoming)
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

    for (var entry of incoming) {
      let { date, timestamp, ...other } = entry
      date = +(date || timestamp)

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

  // returns true|false if this intersects incoming segment
  intersects(segment) {
    if (!(segment instanceof Segment)) {
      throw new TypeError('Segment.intersects(segment) requires a Segment argument')
    }

    const inside = isBetween(this.start, this.end)
    const { start, end } = segment

    return inside(start) || inside(end) || isBetween(start, end)(this.start)
  }

  // sorted getter, cached upon inquiry for memoization
  get sorted() {
    if (this._sorted) return this._sorted

    return this._sorted = [...this].sort((a, b) => a[0] > b[0] ? 1 : -1).map(i => i[1])
  }
}

module.exports = {
  Segment,
}
