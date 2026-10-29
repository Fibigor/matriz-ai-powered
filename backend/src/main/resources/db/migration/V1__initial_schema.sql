CREATE TABLE app_user (
    id VARCHAR(80) PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
CREATE TABLE project (
    id VARCHAR(80) PRIMARY KEY,
    name VARCHAR(120) NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
    description VARCHAR(2000) NOT NULL DEFAULT '',
    owner_user_id VARCHAR(80) NOT NULL REFERENCES app_user(id),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE participation (
    project_id VARCHAR(80) NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    user_id VARCHAR(80) NOT NULL REFERENCES app_user(id),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (project_id, user_id)
);
ALTER TABLE project ADD CONSTRAINT project_owner_participation
    FOREIGN KEY (id, owner_user_id) REFERENCES participation(project_id, user_id)
    DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE task (
    id VARCHAR(80) PRIMARY KEY,
    project_id VARCHAR(80) NOT NULL REFERENCES project(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL CHECK (char_length(btrim(title)) BETWEEN 1 AND 200),
    description VARCHAR(2000) NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO','IN_PROGRESS','DONE')),
    priority VARCHAR(10) NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH')),
    version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id, project_id)
);
CREATE TABLE task_assignment (
    task_id VARCHAR(80) NOT NULL,
    project_id VARCHAR(80) NOT NULL,
    user_id VARCHAR(80) NOT NULL,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id),
    FOREIGN KEY (task_id, project_id) REFERENCES task(id, project_id) ON DELETE CASCADE,
    FOREIGN KEY (project_id, user_id) REFERENCES participation(project_id, user_id)
);
CREATE TABLE task_comment (
    id VARCHAR(80) PRIMARY KEY,
    task_id VARCHAR(80) NOT NULL REFERENCES task(id) ON DELETE CASCADE,
    author_id VARCHAR(80) NOT NULL REFERENCES app_user(id),
    content VARCHAR(2000) NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX task_project_order ON task(project_id, created_at, id);
CREATE INDEX participation_user ON participation(user_id, project_id);
CREATE INDEX comment_task_order ON task_comment(task_id, created_at, id);
CREATE INDEX assignment_participant ON task_assignment(project_id, user_id);
