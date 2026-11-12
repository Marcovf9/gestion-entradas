package com.epifania.entradas.controllers;

import com.epifania.entradas.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReservaControllerSecurityTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private JwtService jwtService;

    @Test
    void elPublicoNoPuedeVerReservasNiConfirmarNiLiberar() throws Exception {
        mvc.perform(get("/api/reservas/activas")).andExpect(status().isForbidden());
        mvc.perform(get("/api/reservas/vendidas")).andExpect(status().isForbidden());
        mvc.perform(post("/api/reservas/confirmar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"seatIds\":[1]}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/reservas/liberar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"seatIds\":[1]}")).andExpect(status().isForbidden());
        mvc.perform(post("/api/reservas/1/confirmar")).andExpect(status().isForbidden());
    }

    @Test
    void elAdminAutenticadoPasaLaSeguridad() throws Exception {
        String token = jwtService.generarToken("admin@test.com");
        mvc.perform(post("/api/reservas/liberar")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"seatIds\":[999999]}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void noSePuedenReservarMasDeDiezButacasPorVez() throws Exception {
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"seatIds\":[1,2,3,4,5,6,7,8,9,10,11],"
                                + "\"nombre\":\"Ana\",\"dni\":\"30111222\",\"email\":\"ana@example.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.seatIds").exists());
    }

    @Test
    void laReservaValidaLosDatosDelCliente() throws Exception {
        mvc.perform(post("/api/reservas").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"seatIds\":[1],\"nombre\":\"\",\"dni\":\"\",\"email\":\"no-es-un-mail\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nombre").exists())
                .andExpect(jsonPath("$.campos.dni").exists())
                .andExpect(jsonPath("$.campos.email").exists());
    }
}
