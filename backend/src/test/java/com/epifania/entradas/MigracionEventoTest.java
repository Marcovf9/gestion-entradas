package com.epifania.entradas;

import com.epifania.entradas.dto.ButacaDTO;
import com.epifania.entradas.dto.ElementoMapaDTO;
import com.epifania.entradas.dto.EventoDTO;
import com.epifania.entradas.dto.ZonaDTO;
import com.epifania.entradas.models.enums.EstadoButaca;
import com.epifania.entradas.services.EventoService;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Corre las migraciones de Flyway desde cero contra Postgres y verifica que el
 * evento "El Deseo de Existir" quede cargado tal cual el plano de la Sala Mayor.
 */
@SpringBootTest
@ActiveProfiles("test")
class MigracionEventoTest {

    @Autowired
    private Flyway flyway;
    @Autowired
    private EventoService eventoService;

    private Long eventoId;
    private List<ButacaDTO> butacas;
    private Map<Long, ZonaDTO> zonas;

    @BeforeEach
    void migrarDesdeCero() {
        flyway.clean();
        flyway.migrate();

        List<EventoDTO> activos = eventoService.listarActivos();
        assertEquals(1, activos.size(), "Solo el evento nuevo debe quedar activo");
        EventoDTO evento = activos.get(0);
        eventoId = evento.getId();
        butacas = eventoService.listarButacas(eventoId);
        zonas = eventoService.listarZonas(eventoId).stream()
                .collect(Collectors.toMap(ZonaDTO::getId, z -> z));
    }

    @Test
    void datosDelShow() {
        EventoDTO evento = eventoService.listarActivos().get(0);
        assertEquals("El Deseo de Existir", evento.getNombre());
        assertEquals(LocalDate.of(2026, 12, 6), evento.getFecha());
        assertEquals(LocalTime.of(19, 30), evento.getHora());
        assertTrue(evento.getLugar().contains("Sala Mayor"));
    }

    @Test
    void sonTrescientasButacasYSoloDoscientasOchentaYCuatroSeVenden() {
        assertEquals(300, butacas.size());
        assertEquals(284, contar(b -> b.getEstado() == EstadoButaca.DISPONIBLE));
        assertEquals(16, contar(b -> b.getEstado() == EstadoButaca.BLOQUEADA));
    }

    @Test
    void cantidadDeButacasPorFila() {
        for (int fila = 1; fila <= 14; fila++) {
            int f = fila;
            assertEquals(19, contar(b -> b.getFila() == f), "fila " + fila);
        }
        assertEquals(18, contar(b -> b.getFila() == 15));
        assertEquals(10, contar(b -> b.getFila() == 16));
        assertEquals(6, contar(b -> b.getFila() == 17));
    }

    @Test
    void lasButacasBeigeSonLasDeLasFilas16y17() {
        assertTrue(butacas.stream()
                .filter(b -> b.getFila() >= 16)
                .allMatch(b -> b.getEstado() == EstadoButaca.BLOQUEADA));
        assertTrue(butacas.stream()
                .filter(b -> b.getFila() <= 15)
                .allMatch(b -> b.getEstado() == EstadoButaca.DISPONIBLE));
    }

    @Test
    void preciosPorFila() {
        butacas.stream().filter(b -> b.getFila() <= 5)
                .forEach(b -> assertEquals(25000, zonas.get(b.getZonaId()).getPrecio(), "fila " + b.getFila()));
        butacas.stream().filter(b -> b.getFila() >= 6 && b.getFila() <= 15)
                .forEach(b -> assertEquals(20000, zonas.get(b.getZonaId()).getPrecio(), "fila " + b.getFila()));
    }

    @Test
    void posicionesEnElPlano() {
        assertEquals(1, pos(15, 1), "la fila 15 va desplazada medio asiento");
        assertEquals(35, pos(15, 18));
        assertEquals(0, pos(16, 1));
        assertEquals(8, pos(16, 5));
        assertEquals(28, pos(16, 6), "la butaca 6 de la fila 16 queda a la derecha de la cabina");
        assertEquals(36, pos(16, 10));
        assertEquals(26, pos(17, 1));
        assertEquals(36, pos(17, 6));
    }

    @Test
    void laCabinaOcupaElHuecoDeLaFila16SinPisarButacas() {
        List<ElementoMapaDTO> elementos = eventoService.listarElementos(eventoId);
        assertEquals(1, elementos.size());
        ElementoMapaDTO cabina = elementos.get(0);
        assertEquals("CABINA", cabina.getEtiqueta());
        assertEquals(16, cabina.getFila());

        butacas.stream().filter(b -> b.getFila() == 16).forEach(b -> {
            boolean pisa = b.getPosX() < cabina.getPosX() + cabina.getAncho() && b.getPosX() + 2 > cabina.getPosX();
            assertFalse(pisa, "la butaca " + b.getColumna() + " de la fila 16 no puede pisar la cabina");
        });
    }

    @Test
    void ningunaButacaSePisaConOtraEnLaMismaFila() {
        Map<Integer, List<ButacaDTO>> porFila = butacas.stream().collect(Collectors.groupingBy(ButacaDTO::getFila));
        porFila.forEach((fila, lista) -> {
            long distintas = lista.stream().map(ButacaDTO::getPosX).distinct().count();
            assertEquals(lista.size(), distintas, "posiciones repetidas en fila " + fila);
            List<Integer> xs = lista.stream().map(ButacaDTO::getPosX).sorted().collect(Collectors.toList());
            for (int i = 1; i < xs.size(); i++) {
                assertTrue(xs.get(i) - xs.get(i - 1) >= 2, "butacas pisadas en fila " + fila);
            }
        });
    }

    private long contar(Predicate<ButacaDTO> filtro) {
        return butacas.stream().filter(filtro).count();
    }

    private int pos(int fila, int columna) {
        return butacas.stream()
                .filter(b -> b.getFila() == fila && b.getColumna() == columna)
                .findFirst().orElseThrow().getPosX();
    }
}
