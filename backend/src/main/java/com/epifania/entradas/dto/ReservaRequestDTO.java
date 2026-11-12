package com.epifania.entradas.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequestDTO {

    public static final int MAX_BUTACAS = 10;

    @NotEmpty(message = "No se enviaron butacas a reservar")
    @Size(max = MAX_BUTACAS, message = "Podés reservar hasta " + MAX_BUTACAS + " butacas por vez")
    private List<Long> seatIds;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 120, message = "El nombre es demasiado largo")
    private String nombre;

    @NotBlank(message = "El DNI es obligatorio")
    @Size(max = 20, message = "El DNI es demasiado largo")
    private String dni;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Size(max = 150, message = "El email es demasiado largo")
    private String email;
}
