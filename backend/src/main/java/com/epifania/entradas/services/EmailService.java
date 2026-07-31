package com.epifania.entradas.services;

import com.epifania.entradas.dto.ReservaSeatDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

/**
 * Envío de confirmación por email al reservar. Es best-effort: si falla, se
 * loguea pero nunca hace fallar la reserva (la reserva ya quedó guardada en
 * la base antes de llamar a este servicio).
 */
@Service
@Slf4j
public class EmailService {

    private static final DateTimeFormatter FORMATO_HORA = DateTimeFormatter.ofPattern("HH:mm 'del' dd/MM/yyyy");

    private final JavaMailSender mailSender;
    private final String remitente;
    private final boolean habilitado;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${spring.mail.username:}") String remitente) {
        this.mailSender = mailSender;
        this.remitente = remitente;
        this.habilitado = remitente != null && !remitente.isBlank();
    }

    @Async
    public void enviarConfirmacionReserva(String destinatario, String nombreCliente, List<ReservaSeatDTO> seats, LocalDateTime vence) {
        if (!habilitado) {
            log.info("Envío de email deshabilitado (no hay spring.mail.username configurado); se omite confirmación a {}", destinatario);
            return;
        }
        try {
            int total = seats.stream().mapToInt(ReservaSeatDTO::getPrecio).sum();
            StringBuilder detalle = new StringBuilder();
            for (ReservaSeatDTO seat : seats) {
                detalle.append(String.format(Locale.forLanguageTag("es-AR"),
                        "- %s, fila %d, butaca %d ($%,d)%n",
                        seat.getZonaNombre(), seat.getFila(), seat.getColumna(), seat.getPrecio()));
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remitente);
            message.setTo(destinatario);
            message.setSubject("Reserva de entradas - Latidos de la Historia");
            message.setText(String.format(Locale.forLanguageTag("es-AR"),
                    "Hola %s,%n%nTu reserva quedó registrada:%n%n%s%nTotal: $%,d%n%n"
                            + "Tenés hasta las %s para confirmar el pago, o la reserva se libera automáticamente.%n%n"
                            + "Latidos de la Historia",
                    nombreCliente, detalle, total, vence.format(FORMATO_HORA)));

            mailSender.send(message);
        } catch (Exception e) {
            log.warn("No se pudo enviar el email de confirmación a {}: {}", destinatario, e.getMessage());
        }
    }
}
