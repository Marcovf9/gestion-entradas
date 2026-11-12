-- Nuevos precios de "El Deseo de Existir":
--   filas 1 a 5   -> $28.000  (platea preferencial)
--   filas 6 a 9   -> $25.000  (platea intermedia, categoría nueva)
--   filas 10 a 15 -> $20.000  (platea general)
-- La categoría "general" conserva su id (y por lo tanto el estado de sus
-- butacas); solo las butacas de las filas 6 a 9 pasan a la categoría nueva.

UPDATE zonas SET precio = 28000
WHERE nombre = 'Platea preferencial (filas 1 a 5)';

UPDATE zonas SET nombre = 'Platea general (filas 10 a 15)', display_order = 3
WHERE nombre = 'Platea general (filas 6 a 15)';

UPDATE zonas SET display_order = 4
WHERE nombre = 'Reservadas (no se venden)';

-- INSERT ... SELECT: si la categoría general no existe (base sin datos), no inserta nada.
INSERT INTO zonas (evento_id, nombre, precio, color, display_order)
SELECT evento_id, 'Platea intermedia (filas 6 a 9)', 25000, '#8a5cc2', 2
FROM zonas
WHERE nombre = 'Platea general (filas 10 a 15)';

UPDATE butacas
SET zona_id = (SELECT id FROM zonas WHERE nombre = 'Platea intermedia (filas 6 a 9)')
WHERE fila BETWEEN 6 AND 9
  AND zona_id = (SELECT id FROM zonas WHERE nombre = 'Platea general (filas 10 a 15)');
