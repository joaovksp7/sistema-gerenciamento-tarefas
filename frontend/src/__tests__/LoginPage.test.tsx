import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const renderLogin = () =>
  render(
    <MemoryRouter>
      <AuthContext.Provider
        value={{ user: null, isAuthenticated: false, login: mockLogin, register: vi.fn(), logout: vi.fn() }}
      >
        <LoginPage />
      </AuthContext.Provider>
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza campos de e-mail e senha', () => {
    renderLogin();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('chama login com os dados preenchidos', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '123456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', '123456');
    });
  });

  it('exibe mensagem de erro quando login falha', async () => {
    mockLogin.mockRejectedValueOnce({ response: { data: { error: 'Credenciais inválidas' } } });
    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'errado@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'senhaerrada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciais inválidas')).toBeInTheDocument();
    });
  });

  it('tem link para a página de registro', () => {
    renderLogin();
    expect(screen.getByText('Criar conta')).toBeInTheDocument();
  });
});
