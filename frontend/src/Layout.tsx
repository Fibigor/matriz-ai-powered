import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { User } from './types';

function Navigation({ projects, close }: { projects: boolean; close?: () => void }) {
  return <nav aria-label="Navegação principal" className="sidebar-nav">
    <a href="#/" aria-current={!projects ? 'page' : undefined} onClick={close}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
      Painel
    </a>
    <a href="#/projects" aria-current={projects ? 'page' : undefined} onClick={close}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7V5a1 1 0 0 1 1-1h6l2 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M3 10h18" /></svg>
      Projetos
    </a>
  </nav>;
}

function SidebarContent({ projects, close }: { projects: boolean; close?: () => void }) {
  return <div className="sidebar-content">
    <div className="sidebar-workspace">
      <span className="workspace-icon" aria-hidden="true">M</span><div><strong>Matriz</strong><small>O seu espaço de trabalho</small></div>
      {close && <button className="icon-button drawer-close" onClick={close} aria-label="Fechar menu">×</button>}
    </div>
    <p className="sidebar-caption">Navegação</p>
    <Navigation projects={projects} close={close} />
    <div className="sidebar-footnote"><span aria-hidden="true">●</span> Área autenticada</div>
  </div>;
}

export function Layout({ user, route, busy, onLogout, children }: {
  user: User; route: string; busy: boolean; onLogout: () => void; children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  const main = useRef<HTMLElement>(null);
  const projects = route.split('/')[0] === 'projects';
  const parts = route.split('/');
  const title = !projects ? 'Painel' : parts[2] === 'tasks' && parts[3] ? 'Detalhe da tarefa' : parts[1] ? 'Detalhe do projeto' : 'Projetos';
  const initials = user.displayName.trim().split(/\s+/).slice(0, 2).map(part => Array.from(part)[0]).join('');
  const closeMenu = () => drawer.current?.close();
  useEffect(() => { if (drawer.current?.open) drawer.current.close(); }, [route]);

  return <div className="app-shell">
    <a className="skip-link" href="#main-content" onClick={event => {
      event.preventDefault(); main.current?.focus();
    }}>Saltar para o conteúdo</a>
      <header className="topbar">
        <button className="icon-button menu-toggle" aria-label="Abrir menu" aria-controls="mobile-navigation" aria-expanded={menuOpen}
          onClick={() => { drawer.current?.showModal(); setMenuOpen(true); }}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <a className="topbar-brand" href="#/"><span className="brand-mark" aria-hidden="true">M</span>MATRIZ</a>
        <div className="workspace-title"><span>Espaço de trabalho</span><p>{title}</p></div>
        <div className="user-session"><span className="avatar" aria-label={'Utilizador: ' + user.displayName}>{initials}</span>
          <span className="user-name" title={user.displayName}>{user.displayName}</span>
          <button className="button-quiet logout-button" disabled={busy} onClick={onLogout}>Sair</button>
        </div>
      </header>
    <aside className="desktop-sidebar"><SidebarContent projects={projects} /></aside>
    <dialog ref={drawer} id="mobile-navigation" className="mobile-drawer" aria-label="Menu de navegação"
      onClose={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeMenu(); }}>
      <SidebarContent projects={projects} close={closeMenu} />
    </dialog>
    <div className="app-workspace">
      <main id="main-content" ref={main} tabIndex={-1}>{children}</main>
      <footer><span>MATRIZ <span className="footer-dot">·</span> O trabalho ganha forma.</span><span>Demonstração académica · Dados fictícios</span></footer>
    </div>
  </div>;
}
