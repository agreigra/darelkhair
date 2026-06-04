import { Module } from '@nestjs/common';
import { ApartmentsController } from './apartments.controller';
import { AdminApartmentsController } from './admin-apartments.controller';
import { ApartmentsService } from './apartments.service';
import { ApartmentsRepository } from './apartments.repository';

@Module({
  controllers: [ApartmentsController, AdminApartmentsController],
  providers: [ApartmentsService, ApartmentsRepository],
  exports: [ApartmentsService],
})
export class ApartmentsModule {}
