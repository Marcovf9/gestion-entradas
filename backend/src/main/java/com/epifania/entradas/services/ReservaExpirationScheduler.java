package com.epifania.entradas.services;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ReservaExpirationScheduler {

    private final ReservaService reservaService;

    @Scheduled(fixedRate = 60_000)
    public void liberarReservasVencidas() {
        reservaService.expirarReservasVencidas();
    }
}
