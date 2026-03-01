export type SegmentDraft = {
  startTime: string
  endTime: string
  specificDatesRaw: string
  exclusionDatesRaw: string
  daysOfWeekRaw: string
  daysOfMonthRaw: string
}

export type SegmentDraftAnalysis = {
  specificDates: string[]
  exclusionDates: string[]
  daysOfWeek: number[]
  daysOfMonth: number[]
  conflictDates: string[]
  crossesMidnight: boolean
  hasRules: boolean
}

const uniqueSortedStrings = (values: string[]) =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b))

const uniqueSortedNumbers = (values: number[]) =>
  [...new Set(values)].sort((a, b) => a - b)

export class SegmentRulesService {
  static parseCsvDates(raw: string): string[] {
    return uniqueSortedStrings(
      raw
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    )
  }

  static parseCsvPositiveIntegers(raw: string): number[] {
    return uniqueSortedNumbers(
      raw
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value > 0),
    )
  }

  static analyzeDraft(draft: SegmentDraft): SegmentDraftAnalysis {
    const specificDates = this.parseCsvDates(draft.specificDatesRaw)
    const exclusionDates = this.parseCsvDates(draft.exclusionDatesRaw)
    const daysOfWeek = this.parseCsvPositiveIntegers(draft.daysOfWeekRaw)
    const daysOfMonth = this.parseCsvPositiveIntegers(draft.daysOfMonthRaw)
    const exclusionSet = new Set(exclusionDates)
    const conflictDates = specificDates.filter((date) => exclusionSet.has(date))
    const crossesMidnight =
      draft.startTime.length > 0 &&
      draft.endTime.length > 0 &&
      draft.endTime < draft.startTime
    const hasRules =
      specificDates.length > 0 ||
      daysOfWeek.length > 0 ||
      daysOfMonth.length > 0

    return {
      specificDates,
      exclusionDates,
      daysOfWeek,
      daysOfMonth,
      conflictDates,
      crossesMidnight,
      hasRules,
    }
  }
}

