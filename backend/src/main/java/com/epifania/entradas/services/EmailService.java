package com.epifania.entradas.services;

import com.epifania.entradas.dto.ReservaSeatDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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

    private static final Locale ES_AR = Locale.forLanguageTag("es-AR");
    private static final DateTimeFormatter FORMATO_VENCE = DateTimeFormatter.ofPattern("HH:mm 'hs'");
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("EEEE d 'de' MMMM", ES_AR);

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
    public void enviarConfirmacionReserva(String destinatario, String nombreCliente, List<ReservaSeatDTO> seats,
                                          LocalDateTime vence, String eventoNombre, LocalDate fecha,
                                          LocalTime hora, String lugar) {
        if (!habilitado) {
            log.info("Envío de email deshabilitado (no hay spring.mail.username configurado); se omite confirmación a {}", destinatario);
            return;
        }
        try {
            int total = seats.stream().mapToInt(ReservaSeatDTO::getPrecio).sum();
            StringBuilder detalle = new StringBuilder();
            for (ReservaSeatDTO seat : seats) {
                detalle.append(String.format(ES_AR, "- Fila %d, butaca %d — $%,d · %s%n",
                        seat.getFila(), seat.getColumna(), seat.getPrecio(), seat.getZonaNombre()));
            }

            StringBuilder texto = new StringBuilder();
            texto.append("Hola ").append(nombreCliente).append(",\n\n");
            texto.append("Tu reserva para \"").append(eventoNombre).append("\" quedó registrada.\n");
            if (fecha != null) {
                texto.append(fecha.format(FORMATO_FECHA));
                if (hora != null) {
                    texto.append(" · ").append(hora.format(FORMATO_VENCE));
                }
                texto.append("\n");
            }
            if (lugar != null && !lugar.isBlank()) {
                texto.append(lugar).append("\n");
            }
            texto.append("\nButacas:\n").append(detalle);
            texto.append(String.format(ES_AR, "%nTotal: $%,d%n%n", total));
            texto.append("Tenés hasta las ").append(vence.format(FORMATO_VENCE))
                    .append(" para enviar el comprobante de pago por WhatsApp; ")
                    .append("pasado ese horario las butacas se liberan automáticamente.\n\n")
                    .append("Epifanía Dance");

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(remitente);
            message.setTo(destinatario);
            message.setSubject("Tu reserva para " + eventoNombre);
            message.setText(texto.toString());

            mailSender.send(message);
        } catch (Exception e) {
            log.warn("No se pudo enviar el email de confirmación a {}: {}", destinatario, e.getMessage());
        }
    }
}
