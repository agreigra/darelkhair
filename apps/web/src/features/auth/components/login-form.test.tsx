import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AxiosError } from 'axios';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { LoginForm } from './login-form';
import { authApi } from '../api/auth.api';

// Locale-aware navigation needs the Next app-router context, which jsdom lacks —
// stub it to a no-op router + plain anchor.
vi.mock('@/i18n/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('../api/auth.api', () => ({
  authApi: { login: vi.fn() },
}));

const mockedApi = vi.mocked(authApi, true);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginForm', () => {
  it('shows the invalid-credentials message on a 401', async () => {
    mockedApi.login.mockRejectedValue(
      new AxiosError('Unauthorized', '401', undefined, undefined, {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {} as never,
      }),
    );

    renderWithProviders(<LoginForm />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'whatever');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      await screen.findByText('Incorrect email or password.'),
    ).toBeInTheDocument();
  });

  it('renders a link to the forgot-password page', () => {
    mockedApi.login.mockResolvedValue({} as never);
    renderWithProviders(<LoginForm />);
    expect(
      screen.getByRole('link', { name: 'Forgot password?' }),
    ).toHaveAttribute('href', '/forgot-password');
  });
});
