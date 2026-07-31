package com.epifania.entradas.services;

import com.epifania.entradas.dto.ReservaRequestDTO;
import com.epifania.entradas.exception.ConflictoReservaException;
import com.epifania.entradas.models.Butaca;
import com.epifania.entradas.models.Evento;
import com.epifania.entradas.models.Zona;
import com.epifania.entradas.models.enums.EstadoButaca;
import com.epifania.entradas.models.enums.GridColumn;
import com.epifania.entradas.repositories.ButacaRepository;
import com.epifania.entradas.repositories.EventoRepository;
import com.epifania.entradas.repositories.ZonaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ReservaServiceIntegrationTest {

    @Autowired
    private ReservaService reservaService;
    @Autowired
    private EventoRepository eventoRepository;
    @Autowired
    private ZonaRepository zonaRepository;
    @Autowired
    private ButacaRepository butacaRepository;

    private Long butacaDisponibleId;

    @BeforeEach
    void setUp() {
        butacaRepository.deleteAll();
        zonaRepository.deleteAll();
        eventoRepository.deleteAll();

        Evento evento = eventoRepository.save(Evento.builder()
                .nombre("Evento de prueba")
                .fecha(LocalDate.now().plusMonths(1))
                .activo(true)
                .build());

        Zona zona = zonaRepository.save(Zona.builder()
                .evento(evento)
                .nombre("Platea baja")
                .precio(25000)
                .color("#f5d742")
                .displayOrder(1)
                .gridColumn(GridColumn.CENTRO)
                .skewDeg(0)
                .build());

        Butaca butaca = butacaRepository.save(Butaca.builder()
                .zona(zona)
                .fila(1)
                .columna(1)
                .estado(EstadoButaca.DISPONIBLE)
                .build());

        butacaDisponibleId = butaca.getId();
    }

    @Test
    void reservaUnaButacaDisponible() {
        ReservaRequestDTO request = new ReservaRequestDTO(
                List.of(butacaDisponibleId), "Juana Pérez", "30111222", "juana@example.com");

        var resultado = reservaService.crearReserva(request);

        assertEquals(1, resultado.getSeats().size());
        assertEquals(EstadoButaca.RESERVADA, butacaRepository.findById(butacaDisponibleId).orElseThrow().getEstado());
    }

    @Test
    void noPermiteReservarUnaButacaYaReservada() {
        reservaService.crearReserva(new ReservaRequestDTO(
                List.of(butacaDisponibleId), "Primero", "1", "primero@example.com"));

        assertThrows(ConflictoReservaException.class, () -> reservaService.crearReserva(new ReservaRequestDTO(
                List.of(butacaDisponibleId), "Segundo", "2", "segundo@example.com")));
    }

    @Test
    void dosReservasConcurrentesPorLaMismaButaca_soloUnaGana() throws InterruptedException {
        int intentos = 2;
        ExecutorService pool = Executors.newFixedThreadPool(intentos);
        CountDownLatch salida = new CountDownLatch(1);
        CountDownLatch listos = new CountDownLatch(intentos);
        AtomicInteger exitos = new AtomicInteger(0);
        AtomicInteger conflictos = new AtomicInteger(0);

        for (int i = 0; i < intentos; i++) {
            int n = i;
            pool.submit(() -> {
                try {
                    listos.countDown();
                    salida.await();
                    reservaService.crearReserva(new ReservaRequestDTO(
                            List.of(butacaDisponibleId), "Cliente " + n, "dni" + n, "cliente" + n + "@example.com"));
                    exitos.incrementAndGet();
                } catch (ConflictoReservaException e) {
                    conflictos.incrementAndGet();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
        }

        listos.await();
        salida.countDown();
        pool.shutdown();
        assertTrue(pool.awaitTermination(10, java.util.concurrent.TimeUnit.SECONDS));

        assertEquals(1, exitos.get(), "Solo una de las dos reservas concurrentes debería haber ganado");
        assertEquals(1, conflictos.get());
        assertEquals(EstadoButaca.RESERVADA, butacaRepository.findById(butacaDisponibleId).orElseThrow().getEstado());
    }
}
