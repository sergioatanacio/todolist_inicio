import { SegmentRulesService } from '../../../dominio/servicios/SegmentRulesService'

export const parseCsvDates = (raw: string): string[] =>
  SegmentRulesService.parseCsvDates(raw)

export const parseCsvNumbers = (raw: string): number[] =>
  SegmentRulesService.parseCsvPositiveIntegers(raw)
