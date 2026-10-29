import { useState } from 'react';
import { query, write } from './api';
import { Members, ProjectSettings } from './Projects';
import type { CommentPage, Member, Priority, Project, Status, Task, TaskPage } from './types';
import { priorityLabels, statusLabels } from './types';
import { Feedback, FieldError, LoadState, Pager, ProgressCard, submit, useMutation, useResource } from './ui';

export function TaskList({ data }: { data: TaskPage }) {
  if (!data.items.length) return <p className="empty-state">Sem tarefas para os critérios selecionados.</p>;
  return <div className="table-scroll"><table><thead><tr><th>Tarefa</th><th>Estado</th><th>Prioridade</th><th>Responsáveis</th></tr></thead>
    <tbody>{data.items.map(task => <tr key={task.id}>
      <td><a href={`#/projects/${task.projectId}/tasks/${task.id}`}>{task.title}</a></td>
      <td><span className="status-badge" data-status={task.status}>{statusLabels[task.status]}</span></td>
      <td><span className="priority-label" data-priority={task.priority}>{priorityLabels[task.priority]}</span></td>
      <td>{task.assignees.map(person => person.displayName).join(', ') || 'Sem responsáveis'}</td>
    </tr>)}</tbody></table></div>;
}

export function NewTask({ projectId, changed }: { projectId: string; changed: (task: Task) => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const mutation = useMutation();
  return <section className="card new-task-card"><p className="eyebrow">O próximo passo</p><h2>Nova tarefa</h2><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      const task = await write<Task>(`/projects/${projectId}/tasks`, 'POST', { title, description, priority });
      setTitle(''); setDescription(''); changed(task);
    }, 'Tarefa criada. A listagem e o progresso serão atualizados; os filtros mantêm-se.'))}>
      <label>Título *<input required value={title} onChange={event => setTitle(event.target.value)} /></label><FieldError field="title" errors={mutation.fields} />
      <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
      <label>Prioridade<select value={priority} onChange={event => setPriority(event.target.value as Priority)}>
        {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <p className="form-note">Estado inicial: Por fazer · Sem responsáveis</p>
      <button disabled={mutation.busy}>{mutation.busy ? 'A criar…' : 'Criar tarefa'}</button>
    </form>
  </section>;
}

export function ProjectDetail({ id }: { id: string }) {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const resource = useResource<TaskPage>(`/projects/${id}/tasks?` + query({ status, priority, page }), revision);
  const changed = () => setRevision(value => value + 1);
  return <><nav className="breadcrumbs" aria-label="Localização"><a href="#/projects">← Projetos</a><span aria-hidden="true">/</span><span>Detalhe do projeto</span></nav>
    <div className="project-detail-layout"><div className="project-main">
    <LoadState {...resource}>{resource.data && <>
      <div className="page-heading"><div><p className="eyebrow">Detalhe do projeto</p>
        <h1>{resource.data.project.name}</h1><p className="muted plain-text">{resource.data.project.description}</p></div>
        <span className="role-badge">{resource.data.project.currentRole === 'MANAGER' ? 'Gestor' : 'Membro'}</span>
      </div>
      <ProgressCard progress={resource.data.progress} />
      <div className="management-grid">
      <ProjectSettings key={resource.data.project.id} project={resource.data.project} changed={changed} />
      <Members project={resource.data.project} revision={revision} />
      </div>
      <section className="card task-list-card"><div className="panel-heading"><div><p className="eyebrow">Trabalho em equipa</p><h2>Tarefas</h2></div></div>
      <div className="filters">
        <label>Filtrar por estado<select value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}>
          <option value="">Todos os estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label>Filtrar por prioridade<select value={priority} onChange={event => { setPriority(event.target.value); setPage(1); }}>
          <option value="">Todas as prioridades</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
      </div>
      <TaskList data={resource.data} /><Pager pagination={resource.data.pagination} change={setPage} />
      </section>
    </>}</LoadState>
    </div><div className="project-side">
    {resource.data && !resource.error && <NewTask projectId={id} changed={task => {
      const pagination = resource.data?.pagination;
      if (pagination && (!status || task.status === status) && (!priority || task.priority === priority)) {
        setPage(Math.ceil((pagination.totalItems + 1) / pagination.pageSize));
      }
      changed();
    }} />}
    </div></div>
  </>;
}

function TaskEditor({ task, changed, reload }: { task: Task; changed: () => void; reload: () => void }) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState<Status>(task.status);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const mutation = useMutation();
  const base = `/projects/${task.projectId}/tasks/${task.id}`;
  return <section className="card"><p className="eyebrow">Dê forma ao trabalho</p><h2>Editar tarefa</h2><Feedback {...mutation} />
    <form onSubmit={submit(() => void mutation.run(async () => {
      await write(base, 'PUT', { title, description, status, priority, version: task.version }); changed();
    }))}>
      <label>Título *<input required value={title} onChange={event => setTitle(event.target.value)} /></label><FieldError field="title" errors={mutation.fields} />
      <label>Descrição<textarea value={description} onChange={event => setDescription(event.target.value)} /></label><FieldError field="description" errors={mutation.fields} />
      <div className="filters"><label>Estado<select value={status} onChange={event => setStatus(event.target.value as Status)}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <label>Prioridade<select value={priority} onChange={event => setPriority(event.target.value as Priority)}>
        {Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select></label></div>
      <button disabled={mutation.busy}>Guardar tarefa</button>
    </form>
    {mutation.error && <button onClick={reload}>Consultar versão atual (substitui o rascunho)</button>}
    <button className="danger" disabled={mutation.busy} onClick={() => {
      if (window.confirm('Eliminar a tarefa e os seus comentários e atribuições?')) void mutation.run(async () => {
        await write(base + '?version=' + task.version, 'DELETE'); window.location.hash = '/projects/' + task.projectId;
      });
    }}>Eliminar tarefa</button>
  </section>;
}

function Assignments({ task, project, changed }: { task: Task; project: Project; changed: () => void }) {
  const [target, setTarget] = useState('');
  const mutation = useMutation();
  const members = useResource<Member[]>('/projects/' + project.id + '/members');
  const eligible = members.data?.filter(person => person.active && !task.assignees.some(assigned => assigned.id === person.id)) ?? [];
  const manager = project.currentRole === 'MANAGER';
  return <section className="card"><p className="eyebrow">Quem faz acontecer</p><h2>Responsáveis</h2><Feedback {...mutation} />
    {!task.assignees.length && <p>Sem responsáveis.</p>}
    <ul>{task.assignees.map(person => <li key={person.id}>{person.displayName}{' '}
      {manager && <button disabled={mutation.busy} onClick={() => void mutation.run(async () => {
        await write(`/projects/${project.id}/tasks/${task.id}/assignments/${person.id}?version=${task.version}`, 'DELETE'); changed();
      })}>Retirar {person.displayName}</button>}</li>)}</ul>
    {manager && <LoadState {...members}><form onSubmit={submit(() => void mutation.run(async () => {
      await write(`/projects/${project.id}/tasks/${task.id}/assignments/${target}`, 'PUT', { version: task.version }); setTarget(''); changed();
    }))}>
      <label>Participante elegível<select required value={target} onChange={event => setTarget(event.target.value)}>
        <option value="">Selecionar participante</option>{eligible.map(person => <option key={person.id} value={person.id}>{person.displayName}</option>)}
      </select></label>
      <button disabled={mutation.busy || !target}>Atribuir responsável</button>
    </form></LoadState>}
  </section>;
}

function Comments({ task }: { task: Task }) {
  const [content, setContent] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const path = `/projects/${task.projectId}/tasks/${task.id}/comments`;
  const resource = useResource<CommentPage>(path + '?' + query({ page }), revision);
  const mutation = useMutation();
  return <section className="card comments-card"><p className="eyebrow">A conversa continua</p><h2>Comentários</h2><Feedback {...mutation} />
    <LoadState {...resource}>
      {!resource.data?.items.length && <p>Sem comentários.</p>}
      {resource.data?.items.map(comment => <article className="comment" key={comment.id}>
        <strong>{comment.author.displayName}</strong> · <time dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleString('pt-PT')}</time>
        <p className="plain-text">{comment.content}</p>
      </article>)}
      {resource.data && <Pager pagination={resource.data.pagination} change={setPage} />}
    </LoadState>
    <form onSubmit={submit(() => void mutation.run(async () => {
      await write(path, 'POST', { content }); setContent('');
      if (resource.data) setPage(Math.ceil((resource.data.pagination.totalItems + 1) / resource.data.pagination.pageSize));
      setRevision(value => value + 1);
    }, 'Comentário adicionado.'))}>
      <label>Novo comentário<textarea required value={content} onChange={event => setContent(event.target.value)} /></label><FieldError field="content" errors={mutation.fields} />
      <button disabled={mutation.busy}>{mutation.busy ? 'A enviar…' : 'Adicionar comentário'}</button>
    </form>
  </section>;
}

export function TaskDetail({ projectId, id }: { projectId: string; id: string }) {
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  const task = useResource<Task>(`/projects/${projectId}/tasks/${id}`, revision);
  const project = useResource<Project>('/projects/' + projectId, revision);
  const reload = () => setRevision(value => value + 1);
  const changed = () => { setNotice('Alteração guardada.'); reload(); };
  return <><nav className="breadcrumbs" aria-label="Localização"><a href="#/projects">Projetos</a><span aria-hidden="true">/</span>
    <a href={'#/projects/' + projectId}>← Projeto</a><span aria-hidden="true">/</span><span>Tarefa</span></nav>
    <Feedback success={notice} />
    <div className="task-detail-layout"><div>
    <LoadState loading={task.loading || project.loading} error={task.error || project.error} reload={reload}>
      {task.data && project.data && <>
        <div className="page-heading"><div><p className="eyebrow">Detalhe da tarefa</p><h1>{task.data.title}</h1>
        <p className="muted">{statusLabels[task.data.status]} · Prioridade {priorityLabels[task.data.priority]}</p></div></div>
        <TaskEditor key={task.data.id + ':' + task.data.version} task={task.data} changed={changed} reload={reload} />
        <Assignments task={task.data} project={project.data} changed={changed} />
      </>}
    </LoadState>
    </div><div className="task-side">
    {task.data && !task.error && <Comments key={task.data.id} task={task.data} />}
    </div></div>
  </>;
}
