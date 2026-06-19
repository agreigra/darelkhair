import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { useForgotPassword, useResetPassword, useLogin } from './use-auth';

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
}));

const mockedApi = vi.mocked(authApi, true);

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({ user: null, status: 'loading' });
});

describe('useForgotPassword', () => {
  it('calls the API and resolves to success', async () => {
    mockedApi.forgotPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    result.current.mutate({ email: 'user@example.com' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.forgotPassword).toHaveBeenCalledWith({
      email: 'user@example.com',
    });
  });

  it('surfaces an error state when the API rejects', async () => {
    mockedApi.forgotPassword.mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    result.current.mutate({ email: 'user@example.com' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useResetPassword', () => {
  it('posts the token + new password', async () => {
    mockedApi.resetPassword.mockResolvedValue(undefined);
    const { result } = renderHook(() => useResetPassword(), { wrapper });

    result.current.mutate({ token: 'tok', password: 'newpassword' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedApi.resetPassword).toHaveBeenCalledWith({
      token: 'tok',
      password: 'newpassword',
    });
  });
});

describe('useLogin', () => {
  it('stores the session on success', async () => {
    mockedApi.login.mockResolvedValue({
      accessToken: 'token',
      user: {
        id: 'u1',
        email: 'user@example.com',
        firstName: null,
        lastName: null,
        phone: null,
        role: 'USER',
        createdAt: '2026-01-01T00:00:00Z',
      },
    });
    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({ email: 'user@example.com', password: 'secret' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user?.email).toBe('user@example.com');
  });
});
