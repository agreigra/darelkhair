import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { AppConfigService } from '@/config/app.config';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Outbound email. When SMTP_HOST is configured a real nodemailer transport is
 * used; otherwise the service runs in "log" mode and writes messages to the
 * server console — so the forgot-password flow works in dev with no mail server.
 *
 * Send failures are logged and swallowed so a mail outage never breaks the
 * triggering operation (same rule as the audit log). Callers must therefore
 * never leak send success/failure back to the client.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit(): void {
    const { host, port, secure, user, pass } = this.config.mail;
    if (!host) {
      this.logger.warn(
        'SMTP_HOST not set — emails will be logged to the console, not sent.',
      );
      return;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async send(message: MailMessage): Promise<void> {
    if (!this.transporter) {
      this.logger.log(
        `[mail:log-mode] To: ${message.to} | Subject: ${message.subject}\n${message.text}`,
      );
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.config.mail.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${message.to}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
