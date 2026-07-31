package com.epifania.entradas.controllers;

import com.epifania.entradas.dto.CambiarPasswordRequestDTO;
import com.epifania.entradas.dto.LoginRequestDTO;
import com.epifania.entradas.dto.LoginResponseDTO;
import com.epifania.entradas.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @PostMapping("/cambiar-password")
    public void cambiarPassword(Authentication authentication, @Valid @RequestBody CambiarPasswordRequestDTO request) {
        authService.cambiarPassword(authentication.getName(), request);
    }
}
