import { useEffect, useState, useSyncExternalStore } from 'react';
import { api, ApiError } from './api';
import type { User } from './types';
import { Projects } from './Projects';
import { ProjectDetail, TaskDetail } from './Tasks';
import { Feedback, submit, useMutation } from './ui';
import { Layout } from './Layout';

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}
const hash = () => window.location.hash;

function Login({ loggedIn, notice }: { loggedIn: (user: User) => void; notice: string }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const mutation = useMutation();
  return <main className="login-page">
    <section className="login-intro">
      <div className="login-brand"><span className="brand-mark" aria-hidden="true">M</span> MATRIZ</div>
      <p className="eyebrow">O seu espaço de trabalho</p>
      <h2>Menos dispersão.<br /><span>Mais progresso.</span></h2>
      <p>Organize projetos, partilhe o trabalho com a equipa e acompanhe cada passo.</p>
      <div className="login-decoration" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /></div>
    </section>
    <section className="card login-card"><p className="eyebrow">Bem-vindo de volta</p>
    <h1>Entrar na Matriz</h1><p className="muted">O próximo passo começa aqui.</p>
    <Feedback error={mutation.error || notice} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      const user = await api<User>('/auth/login', { method: 'POST', body: new URLSearchParams({ username, password }) });
      setPassword(''); loggedIn(user);
    }, ''))}>
      <label>Utilizador<input autoComplete="username" required value={username} onChange={event => setUsername(event.target.value)} /></label>
      <label>Palavra-passe<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
      <button disabled={mutation.busy}>{mutation.busy ? 'A entrar…' : 'Entrar'}</button>
    </form>
    <p className="login-note">Utilize a conta disponibilizada para aceder ao seu espaço.</p>
    </section>
  </main>;
}

export default function App() {
  const path = useSyncExternalStore(subscribe, hash).replace(/^#\/?/, '');
  const route = path.split('/');
  const [user, setUser] = useState<User>();
  const [starting, setStarting] = useState(true);
  const [notice, setNotice] = useState('');
  const logout = useMutation();
  useEffect(() => {
    const expired = () => { setUser(undefined); setNotice('A sessão terminou. Inicie sessão novamente.'); };
    window.addEventListener('session-expired', expired);
    api<User>('/auth/me').then(setUser).catch((error: unknown) => {
      if (!(error instanceof ApiError && error.status === 401)) setNotice(error instanceof Error ? error.message : 'Falha ao consultar sessão.');
    }).finally(() => setStarting(false));
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (starting) return <main className="session-loading"><p role="status">A verificar sessão…</p></main>;
  if (!user) return <Login loggedIn={value => { setUser(value); setNotice(''); }} notice={notice} />;
  let content = <Projects dashboard />;
  if (route[0] === 'projects') {
    if (route[1] && route[2] === 'tasks' && route[3]) content = <TaskDetail key={route[3]} projectId={route[1]} id={route[3]} />;
    else if (route[1]) content = <ProjectDetail key={route[1]} id={route[1]} />;
    else content = <Projects />;
  }
  return <Layout user={user} route={path} busy={logout.busy} onLogout={() => void logout.run(async () => {
        await api('/auth/logout', { method: 'POST' }); setUser(undefined); setNotice('Sessão terminada.'); window.location.hash = '/';
      }, '')}>
    <Feedback error={logout.error} />{content}
  </Layout>;
}
