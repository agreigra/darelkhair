import { Matches } from 'class-validator';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** Window for the public calendar: which dates are unavailable between from..to. */
export class AvailabilityQueryDto {
  @Matches(DATE_ONLY, { message: 'from must be YYYY-MM-DD' })
  from!: string;

  @Matches(DATE_ONLY, { message: 'to must be YYYY-MM-DD' })
  to!: string;
}

/** Check whether a specific stay [checkIn, checkOut) is available. */
export class CheckAvailabilityDto {
  @Matches(DATE_ONLY, { message: 'checkIn must be YYYY-MM-DD' })
  checkIn!: string;

  @Matches(DATE_ONLY, { message: 'checkOut must be YYYY-MM-DD' })
  checkOut!: string;
}
