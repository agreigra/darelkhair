import { describe, it, expect } from 'vitest';
import {
  createLoginSchema,
  createRegisterSchema,
  createForgotPasswordSchema,
  createResetPasswordSchema,
} from './auth.schemas';

// Identity translator — assertions check the returned message *key*, so tests
// don't depend on a specific locale's wording.
const t = (key: string) => key;

describe('createLoginSchema', () => {
  it('accepts a valid email + password', () => {
    const result = createLoginSchema(t).safeParse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = createLoginSchema(t).safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('invalidEmail');
  });

  it('requires a non-empty password', () => {
    const result = createLoginSchema(t).safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordRequired');
  });
});

describe('createRegisterSchema', () => {
  it('accepts a minimal valid payload (optional name/phone empty)', () => {
    const result = createRegisterSchema(t).safeParse({
      email: 'user@example.com',
      password: 'longenough',
      firstName: '',
      lastName: '',
      phone: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a too-short password', () => {
    const result = createRegisterSchema(t).safeParse({
      email: 'user@example.com',
      password: 'short',
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordTooShort');
  });
});

describe('createForgotPasswordSchema', () => {
  it('accepts a valid email', () => {
    expect(
      createForgotPasswordSchema(t).safeParse({ email: 'user@example.com' })
        .success,
    ).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = createForgotPasswordSchema(t).safeParse({ email: 'nope' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('invalidEmail');
  });
});

describe('createResetPasswordSchema', () => {
  it('enforces the minimum password length', () => {
    const result = createResetPasswordSchema(t).safeParse({ password: 'short' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe('passwordTooShort');
  });

  it('accepts a long-enough password', () => {
    const result = createResetPasswordSchema(t).safeParse({
      password: 'longenough',
    });
    expect(result.success).toBe(true);
  });
});
