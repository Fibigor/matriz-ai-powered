import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout } from './Layout';

const user = { id: 'ana', displayName: 'Ana Silva' };
const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal');
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close');

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value(this: HTMLDialogElement) {
    this.open = true;
  } });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value(this: HTMLDialogElement) {
    if (this.open) { this.open = false; this.dispatchEvent(new Event('close')); }
  } });
});
afterAll(() => {
  for (const [name, descriptor] of [['showModal', originalShow], ['close', originalClose]] as const) {
    if (descriptor) Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});

describe('Layout do espaço de trabalho', () => {
  it('assinala a navegação de projetos nos detalhes e mantém a conta e logout', async () => {
    const logout = vi.fn();
    render(<Layout user={user} route="projects/alpha/tasks/t1" busy={false} onLogout={logout}><h1>Tarefa</h1></Layout>);
    expect(screen.getByRole('link', { name: 'Projetos' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Painel' })).not.toHaveAttribute('aria-current');
    expect(screen.getByText('Ana Silva')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Sair' }));
    expect(logout).toHaveBeenCalledTimes(1);
  });

  it('abre e fecha a navegação móvel com estado acessível', async () => {
    render(<Layout user={user} route="" busy={false} onLogout={vi.fn()}><h1>Painel</h1></Layout>);
    const browser = userEvent.setup();
    const toggle = screen.getByRole('button', { name: 'Abrir menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await browser.click(toggle);
    const dialog = screen.getByRole('dialog', { name: 'Menu de navegação' });
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await browser.click(within(dialog).getByRole('button', { name: 'Fechar menu' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('fecha o menu ao mudar de rota e bloqueia logout repetido', async () => {
    const props = { user, route: '', busy: true, onLogout: vi.fn(), children: <h1>Conteúdo</h1> };
    const { rerender } = render(<Layout {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menu' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    rerender(<Layout {...props} route="projects" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeDisabled();
  });

  it('salta para o conteúdo sem alterar a rota hash', async () => {
    render(<Layout user={user} route="" busy={false} onLogout={vi.fn()}><h1>Conteúdo</h1></Layout>);
    const hash = window.location.hash;
    await userEvent.click(screen.getByRole('link', { name: 'Saltar para o conteúdo' }));
    expect(screen.getByRole('main')).toHaveFocus();
    expect(window.location.hash).toBe(hash);
  });
});
