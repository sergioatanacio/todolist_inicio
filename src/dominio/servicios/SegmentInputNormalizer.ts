import { SegmentRulesService } from './SegmentRulesService'

export class SegmentInputNormalizer {
  static toDatesCsv(value: string): string[] {
    return SegmentRulesService.parseCsvDates(value)
  }

  static toNumberCsv(value: string): number[] {
    return SegmentRulesService.parseCsvPositiveIntegers(value)
  }
}
