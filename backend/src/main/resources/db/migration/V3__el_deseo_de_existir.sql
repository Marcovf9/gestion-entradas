-- Show 2026 "El Deseo de Existir" (Epifanía Dance) en la Sala Mayor de la
-- Facultad de Derecho (UNC, Córdoba): 300 butacas, de las cuales 284 se
-- venden y 16 (las beige junto a la cabina, filas 16 y 17) no.

-- El evento anterior queda inactivo (no se borra, para no perder historial).
UPDATE eventos SET activo = FALSE WHERE nombre = 'Latidos de la Historia';

-- El layout ya no depende de columnas/skew por zona: las zonas pasan a ser
-- solo categorías de precio, y el mapa se arma con la posición de cada butaca.
ALTER TABLE zonas DROP COLUMN grid_column;
ALTER TABLE zonas DROP COLUMN skew_deg;

ALTER TABLE eventos ADD COLUMN hora  TIME;
ALTER TABLE eventos ADD COLUMN lugar VARCHAR(200);

-- Posición horizontal de la butaca en el plano, en medios asientos: un asiento
-- ocupa 2 unidades, así la fila 15 (18 butacas) puede quedar desplazada medio
-- asiento respecto de las filas de 19.
ALTER TABLE butacas ADD COLUMN pos_x INTEGER NOT NULL DEFAULT 0;
UPDATE butacas SET pos_x = (columna - 1) * 2;

-- Elementos decorativos del plano que ocupan lugar en una fila (ej. la cabina).
CREATE TABLE elementos_mapa (
    id        BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    etiqueta  VARCHAR(50) NOT NULL,
    fila      INTEGER NOT NULL,
    pos_x     INTEGER NOT NULL,
    ancho     INTEGER NOT NULL
);

CREATE INDEX idx_elementos_mapa_evento_id ON elementos_mapa(evento_id);

-- ---------------------------------------------------------------------------
-- Nuevo evento
-- ---------------------------------------------------------------------------
INSERT INTO eventos (nombre, fecha, hora, lugar, activo)
VALUES ('El Deseo de Existir', '2026-12-06', '19:30',
        'Sala Mayor · Facultad de Derecho (UNC), Córdoba', TRUE);

INSERT INTO zonas (evento_id, nombre, precio, color, display_order)
VALUES
    ((SELECT id FROM eventos WHERE nombre = 'El Deseo de Existir'),
     'Platea preferencial (filas 1 a 5)', 25000, '#b8892b', 1),
    ((SELECT id FROM eventos WHERE nombre = 'El Deseo de Existir'),
     'Platea general (filas 6 a 15)', 20000, '#4f6fa8', 2),
    ((SELECT id FROM eventos WHERE nombre = 'El Deseo de Existir'),
     'Reservadas (no se venden)', 0, '#d9c7a0', 3);

-- Filas 1 a 5: preferencial, 19 butacas por fila.
INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Platea preferencial (filas 1 a 5)'),
       f.fila, s.columna, (s.columna - 1) * 2, 'DISPONIBLE'
FROM generate_series(1, 5) AS f(fila), generate_series(1, 19) AS s(columna);

-- Filas 6 a 14: general, 19 butacas por fila.
INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Platea general (filas 6 a 15)'),
       f.fila, s.columna, (s.columna - 1) * 2, 'DISPONIBLE'
FROM generate_series(6, 14) AS f(fila), generate_series(1, 19) AS s(columna);

-- Fila 15: general, 18 butacas, desplazadas medio asiento.
INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Platea general (filas 6 a 15)'),
       15, s.columna, (s.columna - 1) * 2 + 1, 'DISPONIBLE'
FROM generate_series(1, 18) AS s(columna);

-- Fila 16: 5 butacas a la izquierda de la cabina y 5 a la derecha (6 a 10).
INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Reservadas (no se venden)'),
       16, s.columna, (s.columna - 1) * 2, 'BLOQUEADA'
FROM generate_series(1, 5) AS s(columna);

INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Reservadas (no se venden)'),
       16, s.columna, (s.columna + 8) * 2, 'BLOQUEADA'
FROM generate_series(6, 10) AS s(columna);

-- Fila 17: 6 butacas pegadas a la derecha.
INSERT INTO butacas (zona_id, fila, columna, pos_x, estado)
SELECT (SELECT id FROM zonas WHERE nombre = 'Reservadas (no se venden)'),
       17, s.columna, 26 + (s.columna - 1) * 2, 'BLOQUEADA'
FROM generate_series(1, 6) AS s(columna);

-- Cabina: ocupa el hueco de la fila 16 entre las butacas 5 y 6.
INSERT INTO elementos_mapa (evento_id, etiqueta, fila, pos_x, ancho)
VALUES ((SELECT id FROM eventos WHERE nombre = 'El Deseo de Existir'),
        'CABINA', 16, 10, 18);
