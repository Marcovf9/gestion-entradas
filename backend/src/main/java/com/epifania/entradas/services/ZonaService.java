package com.epifania.entradas.services;

import com.epifania.entradas.dto.ZonaDTO;
import com.epifania.entradas.dto.ZonaRequestDTO;
import com.epifania.entradas.exception.RecursoNoEncontradoException;
import com.epifania.entradas.models.Evento;
import com.epifania.entradas.models.Zona;
import com.epifania.entradas.repositories.EventoRepository;
import com.epifania.entradas.repositories.ZonaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ZonaService {

    private final ZonaRepository zonaRepository;
    private final EventoRepository eventoRepository;

    @Transactional
    public ZonaDTO crear(ZonaRequestDTO dto) {
        Evento evento = eventoRepository.findById(dto.getEventoId())
                .orElseThrow(() -> new RecursoNoEncontradoException("Evento", dto.getEventoId()));

        Zona zona = Zona.builder()
                .evento(evento)
                .nombre(dto.getNombre())
                .precio(dto.getPrecio())
                .color(dto.getColor())
                .displayOrder(dto.getDisplayOrder())
                .gridColumn(dto.getGridColumn())
                .skewDeg(dto.getSkewDeg() != null ? dto.getSkewDeg() : 0)
                .build();

        return toDTO(zonaRepository.save(zona));
    }

    @Transactional
    public ZonaDTO actualizar(Long id, ZonaRequestDTO dto) {
        Zona zona = zonaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Zona", id));

        if (!zona.getEvento().getId().equals(dto.getEventoId())) {
            Evento evento = eventoRepository.findById(dto.getEventoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Evento", dto.getEventoId()));
            zona.setEvento(evento);
        }

        zona.setNombre(dto.getNombre());
        zona.setPrecio(dto.getPrecio());
        zona.setColor(dto.getColor());
        zona.setDisplayOrder(dto.getDisplayOrder());
        zona.setGridColumn(dto.getGridColumn());
        zona.setSkewDeg(dto.getSkewDeg() != null ? dto.getSkewDeg() : 0);

        return toDTO(zonaRepository.save(zona));
    }

    @Transactional
    public void eliminar(Long id) {
        if (!zonaRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Zona", id);
        }
        zonaRepository.deleteById(id);
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
}
