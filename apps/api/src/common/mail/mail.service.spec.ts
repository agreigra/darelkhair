import * as nodemailer from 'nodemailer';
import type { AppConfigService } from '@/config/app.config';
import { MailService } from './mail.service';

jest.mock('nodemailer');

const MESSAGE = {
  to: 'user@example.com',
  subject: 'Hello',
  text: 'body',
  html: '<p>body</p>',
};

function buildService(mailConfig: Record<string, unknown>): MailService {
  const config = { mail: mailConfig } as unknown as AppConfigService;
  return new MailService(config);
}

describe('MailService', () => {
  const sendMail = jest.fn();

  beforeEach(() => {
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail });
  });

  describe('log mode (no SMTP host)', () => {
    it('does not build a transport and never throws', async () => {
      const service = buildService({ from: 'from@example.com' });
      service.onModuleInit();

      expect(nodemailer.createTransport).not.toHaveBeenCalled();
      await expect(service.send(MESSAGE)).resolves.toBeUndefined();
      expect(sendMail).not.toHaveBeenCalled();
    });
  });

  describe('SMTP mode (host configured)', () => {
    const smtpConfig = {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      user: 'u',
      pass: 'p',
      from: 'from@example.com',
    };

    it('sends through the transport with the configured From', async () => {
      const service = buildService(smtpConfig);
      service.onModuleInit();

      await service.send(MESSAGE);

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'from@example.com',
          to: 'user@example.com',
          subject: 'Hello',
        }),
      );
    });

    it('swallows send failures (never breaks the caller)', async () => {
      sendMail.mockRejectedValueOnce(new Error('SMTP down'));
      const service = buildService(smtpConfig);
      service.onModuleInit();

      await expect(service.send(MESSAGE)).resolves.toBeUndefined();
    });
  });
});
