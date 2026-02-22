const TIME_RE = /^([01]\d|2[0-4]):([0-5]\d)$/

const parseTime = (raw: string): number => {
  const match = raw.match(TIME_RE)
  if (!match) {
    throw new Error('La hora debe tener formato HH:mm')
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours === 24 && minutes !== 0) {
    throw new Error('24:00 es valido solo con minutos 00')
  }
  return hours * 60 + minutes
}

type TimeInterval = {
  startMinutes: number
  endMinutes: number
}

export class TimeRange {
  private readonly _start: string
  private readonly _end: string
  private readonly _startMinutes: number
  private readonly _endMinutes: number

  private constructor(
    start: string,
    end: string,
    startMinutes: number,
    endMinutes: number,
  ) {
    this._start = start
    this._end = end
    this._startMinutes = startMinutes
    this._endMinutes = endMinutes
  }

  static create(start: string, end: string) {
    const startMinutes = parseTime(start)
    const endMinutes = parseTime(end)
    if (startMinutes === endMinutes) {
      throw new Error('La hora de inicio y fin no pueden ser iguales')
    }
    return new TimeRange(start, end, startMinutes, endMinutes)
  }

  get crossesMidnight() {
    return this._endMinutes <= this._startMinutes
  }

  splitByMidnight(): TimeInterval[] {
    if (!this.crossesMidnight) {
      return [
        {
          startMinutes: this._startMinutes,
          endMinutes: this._endMinutes,
        },
      ]
    }
    return [
      {
        startMinutes: this._startMinutes,
        endMinutes: 24 * 60,
      },
      {
        startMinutes: 0,
        endMinutes: this._endMinutes,
      },
    ]
  }

  durationMinutes() {
    if (!this.crossesMidnight) {
      return this._endMinutes - this._startMinutes
    }
    return 24 * 60 - this._startMinutes + this._endMinutes
  }

  get start() {
    return this._start
  }

  get end() {
    return this._end
  }

  get startMinutes() {
    return this._startMinutes
  }

  get endMinutes() {
    return this._endMinutes
  }
}
