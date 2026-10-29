import { useState } from 'react';
import { write, query } from './api';
import type { Project, ProjectPage, Member } from './types';
import { Feedback, FieldError, LoadState, Pager, ProgressCard, submit, useMutation, useResource } from './ui';

export function Projects({ dashboard = false }: { dashboard?: boolean }) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const resource = useResource<ProjectPage>('/projects?' + query({ search, page }), revision);
  const mutation = useMutation();
  return <>
    <h1>{dashboard ? 'Painel inicial' : 'Projetos'}</h1>
    <label>Pesquisar pelo nome<input value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></label>
    <Feedback {...mutation} />
    <LoadState {...resource}>
      {!resource.data?.items.length && <p>Sem projetos acessíveis.</p>}
      <div className="cards">{resource.data?.items.map(project => <article key={project.id}>
        <h2><a href={'#/projects/' + project.id}>{project.name}</a></h2>
        <p>{project.description}</p><p>{project.currentRole === 'MANAGER' ? 'Gestor' : 'Membro'}</p>
        <ProgressCard progress={project.progress} />
      </article>)}</div>
      {resource.data && <Pager pagination={resource.data.pagination} change={setPage} />}
    </LoadState>
    <section><h2>Criar projeto</h2>
      <form onSubmit={submit(() => void mutation.run(async () => {
        const project = await write<Project>('/projects', 'POST', { name, description });
        const pagination = resource.data?.pagination;
        if (pagination && project.name.toLowerCase().includes(search.toLowerCase())) {
          setPage(Math.ceil((pagination.totalItems + 1) / pagination.pageSize));
        }
        setName(''); setDescription(''); setRevision(value => value + 1);
      }, 'Projeto criado. A listagem será atualizada; a pesquisa mantém-se.'))}>
        <label>Nome do projeto *<input required value={name} onChange={event => setName(event.target.value)} /></label><FieldError field="name" errors={mutation.fields} />
        <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
        <button disabled={mutation.busy}>{mutation.busy ? 'A criar…' : 'Criar projeto'}</button>
      </form>
    </section>
  </>;
}

export function ProjectSettings({ project, changed }: { project: Project; changed: () => void }) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const mutation = useMutation();
  if (project.currentRole !== 'MANAGER') return null;
  return <details><summary>Gerir projeto</summary><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      await write('/projects/' + project.id, 'PUT', { name, description, version: project.version }); changed();
    }))}>
      <label>Nome<input required value={name} onChange={event => setName(event.target.value)} /></label><FieldError field="name" errors={mutation.fields} />
      <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
      <button disabled={mutation.busy}>Guardar projeto</button>
    </form>
    <button className="danger" disabled={mutation.busy} onClick={() => {
      if (window.confirm('Eliminar este projeto e todas as tarefas, comentários, atribuições e participações?')) {
        void mutation.run(async () => {
          await write('/projects/' + project.id + '?version=' + project.version, 'DELETE');
          window.location.hash = '/projects';
        });
      }
    }}>Eliminar projeto</button>
  </details>;
}

export function Members({ project, revision = 0 }: { project: Project; revision?: number }) {
  const [target, setTarget] = useState('');
  const members = useResource<Member[]>('/projects/' + project.id + '/members', revision);
  const mutation = useMutation();
  const manager = project.currentRole === 'MANAGER';
  return <details><summary>Participantes do projeto</summary><Feedback {...mutation} />
    <LoadState {...members}><ul>{members.data?.map(member => <li key={member.id}>
      {member.displayName} · {member.id} · {member.role === 'MANAGER' ? 'Gestor' : 'Membro'}{!member.active && ' · Inativo'}{' '}
      {manager && member.role !== 'MANAGER' && <button disabled={mutation.busy} onClick={() => {
        if (window.confirm('Remover o acesso deste membro ao projeto?')) void mutation.run(async () => {
          await write('/projects/' + project.id + '/members/' + member.id, 'DELETE'); members.reload();
        });
      }}>Remover {member.displayName}</button>}
    </li>)}</ul></LoadState>
    {manager && <form onSubmit={submit(() => void mutation.run(async () => {
      await write('/projects/' + project.id + '/members', 'POST', { userId: target }); setTarget(''); members.reload();
    }, 'Participação confirmada. Adicionar novamente não cria duplicados.'))}>
      <label>Identificador exato do membro<input required value={target} onChange={event => setTarget(event.target.value)} placeholder="user-bruno" /></label>
      <button disabled={mutation.busy}>Adicionar membro</button>
    </form>}
  </details>;
}
