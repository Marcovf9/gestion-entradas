package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.ReservaActivaDTO;
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

    @PostMapping
    public ReservaResponseDTO crearReserva(@Valid @RequestBody ReservaRequestDTO request) {
        return reservaService.crearReserva(request);
    }

    @GetMapping("/activas")
    public List<ReservaActivaDTO> listarActivas() {
        return reservaService.listarActivas();
    }

    @PostMapping("/{seatId}/confirmar")
    public void confirmarPago(@PathVariable Long seatId) {
        reservaService.confirmarPago(seatId);
    }
}
