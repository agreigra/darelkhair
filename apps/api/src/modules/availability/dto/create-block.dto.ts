import { Matches } from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Admin blocks a date range (inclusive). Dates are calendar-only (YYYY-MM-DD). */
export class CreateBlockDto {
  @Matches(DATE_ONLY, { message: 'startDate must be YYYY-MM-DD' })
  startDate!: string;

  @Matches(DATE_ONLY, { message: 'endDate must be YYYY-MM-DD' })
  endDate!: string;
}
