CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE bugs (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    reporter_id BIGINT NOT NULL,
    assigned_user_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT fk_reporter
        FOREIGN KEY (reporter_id)
        REFERENCES users (id),
    
    CONSTRAIN fk_assigned_user
        FOREIGN KEY (assigned_user_id)
        REFERENCES users (id),
);

CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bug_comment
        FOREIGN KEY (bug_id)
        REFERENCES bugs (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_user_comment
        FOREIGN KEY (user_id)
        REFERENCES users (id)
);

CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    bug_id BIGINT NOT NULL,
    file_name VARCAHR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    uploaded_by BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bug_id
        FOREIGN KEY (bug_id)
        REFERENCES bugs (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFFERENCES users (id)
);