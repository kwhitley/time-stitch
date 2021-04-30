describe('main exports', () => {
  it('exports { Segment, Timeline }', () => {
    const { Segment, Timeline } = require('./index')

    expect(Segment.name).toBe('Segment')
    expect(Timeline.name).toBe('Timeline')
  })
})
