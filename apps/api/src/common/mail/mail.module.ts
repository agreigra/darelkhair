import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Global mailer. Any feature can inject MailService without importing this
 * module (same pattern as AuditModule).
 */
@Global()
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
