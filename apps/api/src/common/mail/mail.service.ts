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

type Mode = 'resend' | 'smtp' | 'log';

/**
 * Outbound email. The transport is chosen at boot, in order:
 *   1. Resend HTTP API (RESEND_API_KEY) — sends over HTTPS, so it works on hosts
 *      that block outbound SMTP ports (Railway/Render/Fly). Production path.
 *   2. SMTP via nodemailer (SMTP_HOST) — for local dev or where SMTP is open.
 *   3. "log" mode — writes the message + link to the console (no provider).
 *
 * Send failures are logged and swallowed so a mail outage never breaks the
 * triggering operation (same rule as the audit log). Callers must therefore
 * never leak send success/failure back to the client.
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private mode: Mode = 'log';
  private transporter: Transporter | null = null;

  constructor(private readonly config: AppConfigService) {}

  onModuleInit(): void {
    const { resendApiKey, host, port, secure, user, pass } = this.config.mail;
    if (resendApiKey) {
      this.mode = 'resend';
      return;
    }
    if (host) {
      this.mode = 'smtp';
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
      });
      return;
    }
    this.logger.warn(
      'No email transport configured (set RESEND_API_KEY or SMTP_HOST) — ' +
        'emails will be logged to the console, not sent.',
    );
  }

  async send(message: MailMessage): Promise<void> {
    try {
      if (this.mode === 'resend') {
        await this.sendViaResend(message);
      } else if (this.mode === 'smtp') {
        await this.transporter!.sendMail({
          from: this.config.mail.from,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
      } else {
        this.logger.log(
          `[mail:log-mode] To: ${message.to} | Subject: ${message.subject}\n${message.text}`,
        );
      }
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${message.to}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  /** Send through the Resend HTTP API (https://resend.com/docs/api-reference). */
  private async sendViaResend(message: MailMessage): Promise<void> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.mail.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.config.mail.from,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
    }
  }
}
