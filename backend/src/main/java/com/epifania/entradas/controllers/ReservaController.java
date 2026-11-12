package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.ButacasIdsRequestDTO;
import com.epifania.entradas.dto.ReservaAdminDTO;
import com.epifania.entradas.dto.ReservaRequestDTO;
import com.epifania.entradas.dto.ReservaResponseDTO;
import com.epifania.entradas.services.ReservaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    /** Público: lo usa el comprador. */
    @PostMapping
    public ReservaResponseDTO crearReserva(@Valid @RequestBody ReservaRequestDTO request) {
        return reservaService.crearReserva(request);
    }

    // -- Todo lo de abajo requiere JWT de admin (ver SecurityConfig) --------

    @GetMapping("/activas")
    public List<ReservaAdminDTO> listarActivas(@RequestParam Long eventoId) {
        return reservaService.listarActivas(eventoId);
    }

    @GetMapping("/vendidas")
    public List<ReservaAdminDTO> listarVendidas(@RequestParam Long eventoId) {
        return reservaService.listarVendidas(eventoId);
    }

    @PostMapping("/{seatId}/confirmar")
    public void confirmarPago(@PathVariable Long seatId) {
        reservaService.confirmarPago(seatId);
    }

    @PostMapping("/confirmar")
    public void confirmarPagos(@Valid @RequestBody ButacasIdsRequestDTO request) {
        reservaService.confirmarPagos(request.getSeatIds());
    }

    @PostMapping("/liberar")
    public void liberar(@Valid @RequestBody ButacasIdsRequestDTO request) {
        reservaService.liberar(request.getSeatIds());
    }
}
