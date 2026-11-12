package com.epifania.entradas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class EntradasBackendApplication {

	public static void main(String[] args) {
		// Las fechas de reserva son LocalDateTime (sin zona). Se fija la zona de
		// Córdoba para que "vence a las 14:13" signifique lo mismo en cualquier
		// servidor (en Render corre en UTC, 3 horas de diferencia).
		TimeZone.setDefault(TimeZone.getTimeZone("America/Argentina/Cordoba"));
		SpringApplication.run(EntradasBackendApplication.class, args);
	}

}
