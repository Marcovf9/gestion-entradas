package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.ButacaDTO;
import com.epifania.entradas.dto.EventoDTO;
import com.epifania.entradas.dto.ZonaDTO;
import com.epifania.entradas.services.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/eventos")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService eventoService;

    @GetMapping
    public List<EventoDTO> listarActivos() {
        return eventoService.listarActivos();
    }

    @GetMapping("/{id}/zonas")
    public List<ZonaDTO> listarZonas(@PathVariable Long id) {
        return eventoService.listarZonas(id);
    }

    @GetMapping("/{id}/butacas")
    public List<ButacaDTO> listarButacas(@PathVariable Long id) {
        return eventoService.listarButacas(id);
    }
}
