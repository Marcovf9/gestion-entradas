package com.epifania.entradas.services;

import com.epifania.entradas.dto.ButacaDTO;
import com.epifania.entradas.dto.EventoDTO;
import com.epifania.entradas.dto.EventoRequestDTO;
import com.epifania.entradas.dto.ZonaDTO;
import com.epifania.entradas.exception.RecursoNoEncontradoException;
import com.epifania.entradas.models.Butaca;
import com.epifania.entradas.models.Evento;
import com.epifania.entradas.models.Zona;
import com.epifania.entradas.repositories.ButacaRepository;
import com.epifania.entradas.repositories.EventoRepository;
import com.epifania.entradas.repositories.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;
    private final ZonaRepository zonaRepository;
    private final ButacaRepository butacaRepository;
    private final ReservaService reservaService;

    @Transactional(readOnly = true)
    public List<EventoDTO> listarActivos() {
        return eventoRepository.findByActivoTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ZonaDTO> listarZonas(Long eventoId) {
        obtenerEvento(eventoId);
        return zonaRepository.findByEventoIdOrderByDisplayOrderAsc(eventoId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ButacaDTO> listarButacas(Long eventoId) {
        obtenerEvento(eventoId);
        reservaService.expirarReservasVencidas();
        return butacaRepository.findByZonaEventoIdOrderByZonaIdAscFilaAscColumnaAsc(eventoId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EventoDTO crear(EventoRequestDTO dto) {
        Evento evento = Evento.builder()
                .nombre(dto.getNombre())
                .fecha(dto.getFecha())
                .activo(dto.getActivo() == null || dto.getActivo())
                .build();
        return toDTO(eventoRepository.save(evento));
    }

    @Transactional
    public EventoDTO actualizar(Long id, EventoRequestDTO dto) {
        Evento evento = obtenerEvento(id);
        evento.setNombre(dto.getNombre());
        evento.setFecha(dto.getFecha());
        if (dto.getActivo() != null) {
            evento.setActivo(dto.getActivo());
        }
        return toDTO(eventoRepository.save(evento));
    }

    private Evento obtenerEvento(Long id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Evento", id));
    }

    private EventoDTO toDTO(Evento evento) {
        return EventoDTO.builder()
                .id(evento.getId())
                .nombre(evento.getNombre())
                .fecha(evento.getFecha())
                .activo(evento.getActivo())
                .build();
    }

    private ZonaDTO toDTO(Zona zona) {
        return ZonaDTO.builder()
                .id(zona.getId())
                .eventoId(zona.getEvento().getId())
                .nombre(zona.getNombre())
                .precio(zona.getPrecio())
                .color(zona.getColor())
                .displayOrder(zona.getDisplayOrder())
                .gridColumn(zona.getGridColumn())
                .skewDeg(zona.getSkewDeg())
                .build();
    }

    private ButacaDTO toDTO(Butaca butaca) {
        return ButacaDTO.builder()
                .id(butaca.getId())
                .zonaId(butaca.getZona().getId())
                .fila(butaca.getFila())
                .columna(butaca.getColumna())
                .estado(butaca.getEstado())
                .build();
    }
}
