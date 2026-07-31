CREATE TABLE eventos (
    id     BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    fecha  DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE zonas (
    id            BIGSERIAL PRIMARY KEY,
    evento_id     BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    nombre        VARCHAR(100) NOT NULL,
    precio        INTEGER NOT NULL,
    color         VARCHAR(20) NOT NULL,
    display_order INTEGER NOT NULL,
    grid_column   VARCHAR(20) NOT NULL,
    skew_deg      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_zonas_evento_id ON zonas(evento_id);

CREATE TABLE butacas (
    id             BIGSERIAL PRIMARY KEY,
    zona_id        BIGINT NOT NULL REFERENCES zonas(id) ON DELETE CASCADE,
    fila           INTEGER NOT NULL,
    columna        INTEGER NOT NULL,
    estado         VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
    cliente_nombre VARCHAR(200),
    cliente_dni    VARCHAR(50),
    cliente_email  VARCHAR(200),
    reserva_hasta  TIMESTAMP
);

CREATE INDEX idx_butacas_zona_id ON butacas(zona_id);
CREATE INDEX idx_butacas_estado ON butacas(estado);

CREATE TABLE admin_usuarios (
    id                        BIGSERIAL PRIMARY KEY,
    email                     VARCHAR(150) NOT NULL UNIQUE,
    password_hash             VARCHAR(255) NOT NULL,
    requiere_cambio_password  BOOLEAN NOT NULL DEFAULT FALSE
);
