package com.epifania.entradas.services;

import com.epifania.entradas.dto.ReservaActivaDTO;
import com.epifania.entradas.dto.ReservaRequestDTO;
import com.epifania.entradas.dto.ReservaResponseDTO;
import com.epifania.entradas.dto.ReservaSeatDTO;
import com.epifania.entradas.exception.ConflictoReservaException;
import com.epifania.entradas.exception.RecursoNoEncontradoException;
import com.epifania.entradas.models.Butaca;
import com.epifania.entradas.models.enums.EstadoButaca;
import com.epifania.entradas.repositories.ButacaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservaService {

    private static final int MINUTOS_HOLD = 30;

    private final ButacaRepository butacaRepository;
    private final EmailService emailService;

    /**
     * Toma un lock pesimista sobre las butacas pedidas antes de chequear su
     * estado, así dos reservas concurrentes por la misma butaca no pueden
     * pasar las dos la validación (a diferencia del "leer y después
     * actualizar" del backend anterior en Node/Prisma).
     */
    @Transactional
    public ReservaResponseDTO crearReserva(ReservaRequestDTO request) {
        List<Long> seatIds = request.getSeatIds();

        List<Butaca> butacas = butacaRepository.findAllByIdForUpdate(seatIds);
        if (butacas.size() != seatIds.size()) {
            throw new RecursoNoEncontradoException("Alguna de las butacas no existe");
        }

        LocalDateTime ahora = LocalDateTime.now();
        List<Long> noDisponibles = butacas.stream()
                .filter(b -> !esDisponibleAhora(b, ahora))
                .map(Butaca::getId)
                .collect(Collectors.toList());

        if (!noDisponibles.isEmpty()) {
            throw new ConflictoReservaException(
                    "Alguna de las butacas ya no está disponible. Volvé a cargar el mapa.", noDisponibles);
        }

        LocalDateTime vence = ahora.plusMinutes(MINUTOS_HOLD);
        for (Butaca butaca : butacas) {
            butaca.setEstado(EstadoButaca.RESERVADA);
            butaca.setClienteNombre(request.getNombre());
            butaca.setClienteDni(request.getDni());
            butaca.setClienteEmail(request.getEmail());
            butaca.setReservaHasta(vence);
        }
        butacaRepository.saveAll(butacas);

        List<ReservaSeatDTO> seatDTOs = butacas.stream().map(this::toSeatDTO).collect(Collectors.toList());

        emailService.enviarConfirmacionReserva(request.getEmail(), request.getNombre(), seatDTOs, vence);

        return ReservaResponseDTO.builder()
                .seats(seatDTOs)
                .expiresAt(vence)
                .build();
    }

    /**
     * No es readOnly a propósito: expirarReservasVencidas() se llama como
     * auto-invocación (this.expirarReservasVencidas()), que en Spring AOP
     * no pasa por el proxy — así que su @Transactional(REQUIRES_NEW) no
     * aplica acá, y el UPDATE necesita que ESTA transacción sea de
     * escritura.
     */
    @Transactional
    public List<ReservaActivaDTO> listarActivas() {
        expirarReservasVencidas();
        return butacaRepository.findActivasConHold(EstadoButaca.RESERVADA, LocalDateTime.now()).stream()
                .map(b -> ReservaActivaDTO.builder()
                        .id(b.getId())
                        .zonaNombre(b.getZona().getNombre())
                        .fila(b.getFila())
                        .columna(b.getColumna())
                        .clienteNombre(b.getClienteNombre())
                        .clienteDni(b.getClienteDni())
                        .clienteEmail(b.getClienteEmail())
                        .reservaHasta(b.getReservaHasta())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void confirmarPago(Long seatId) {
        Butaca butaca = butacaRepository.findById(seatId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Butaca", seatId));

        if (butaca.getEstado() != EstadoButaca.RESERVADA) {
            throw new IllegalArgumentException("La butaca no está en estado RESERVADA");
        }

        butaca.setEstado(EstadoButaca.VENDIDA);
        butaca.setReservaHasta(null);
        butacaRepository.save(butaca);
    }

    /**
     * REQUIRES_NEW: esto se llama desde transacciones read-only (ej. al
     * listar butacas), y Postgres rechaza un UPDATE dentro de una
     * transacción read-only. Al abrir su propia transacción de escritura,
     * funciona sin importar el modo de la transacción que la invoque.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void expirarReservasVencidas() {
        int liberadas = butacaRepository.expirarReservasVencidas(LocalDateTime.now());
        if (liberadas > 0) {
            log.info("Se liberaron {} butacas con reserva vencida", liberadas);
        }
    }

    private boolean esDisponibleAhora(Butaca butaca, LocalDateTime ahora) {
        if (butaca.getEstado() == EstadoButaca.DISPONIBLE) {
            return true;
        }
        return butaca.getEstado() == EstadoButaca.RESERVADA
                && butaca.getReservaHasta() != null
                && butaca.getReservaHasta().isBefore(ahora);
    }

    private ReservaSeatDTO toSeatDTO(Butaca butaca) {
        return ReservaSeatDTO.builder()
                .id(butaca.getId())
                .fila(butaca.getFila())
                .columna(butaca.getColumna())
                .zonaNombre(butaca.getZona().getNombre())
                .precio(butaca.getZona().getPrecio())
                .estado(butaca.getEstado())
                .build();
    }
}
