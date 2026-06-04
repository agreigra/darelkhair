import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AdminAvailabilityController } from './admin-availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityRepository } from './availability.repository';

@Module({
  controllers: [AvailabilityController, AdminAvailabilityController],
  providers: [AvailabilityService, AvailabilityRepository],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
