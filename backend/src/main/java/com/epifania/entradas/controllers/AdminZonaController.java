package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.ZonaDTO;
import com.epifania.entradas.dto.ZonaRequestDTO;
import com.epifania.entradas.services.ZonaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/zonas")
@RequiredArgsConstructor
public class AdminZonaController {

    private final ZonaService zonaService;

    @PostMapping
    public ZonaDTO crear(@Valid @RequestBody ZonaRequestDTO dto) {
        return zonaService.crear(dto);
    }

    @PutMapping("/{id}")
    public ZonaDTO actualizar(@PathVariable Long id, @Valid @RequestBody ZonaRequestDTO dto) {
        return zonaService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        zonaService.eliminar(id);
    }
}
