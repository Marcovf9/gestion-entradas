package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.EventoDTO;
import com.epifania.entradas.dto.EventoRequestDTO;
import com.epifania.entradas.services.EventoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/eventos")
@RequiredArgsConstructor
public class AdminEventoController {

    private final EventoService eventoService;

    @PostMapping
    public EventoDTO crear(@Valid @RequestBody EventoRequestDTO dto) {
        return eventoService.crear(dto);
    }

    @PutMapping("/{id}")
    public EventoDTO actualizar(@PathVariable Long id, @Valid @RequestBody EventoRequestDTO dto) {
        return eventoService.actualizar(id, dto);
    }
}
