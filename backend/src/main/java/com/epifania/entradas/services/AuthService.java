package com.epifania.entradas.services;

import com.epifania.entradas.dto.CambiarPasswordRequestDTO;
import com.epifania.entradas.dto.LoginRequestDTO;
import com.epifania.entradas.dto.LoginResponseDTO;
import com.epifania.entradas.exception.CredencialesInvalidasException;
import com.epifania.entradas.models.AdminUsuario;
import com.epifania.entradas.repositories.AdminUsuarioRepository;
import com.epifania.entradas.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AdminUsuarioRepository adminUsuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponseDTO login(LoginRequestDTO request) {
        AdminUsuario admin = adminUsuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CredencialesInvalidasException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw new CredencialesInvalidasException("Email o contraseña incorrectos");
        }

        String token = jwtService.generarToken(admin.getEmail());

        return LoginResponseDTO.builder()
                .token(token)
                .email(admin.getEmail())
                .requiereCambioPassword(admin.getRequiereCambioPassword())
                .build();
    }

    @Transactional
    public void cambiarPassword(String emailAutenticado, CambiarPasswordRequestDTO request) {
        AdminUsuario admin = adminUsuarioRepository.findByEmail(emailAutenticado)
                .orElseThrow(() -> new CredencialesInvalidasException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPasswordActual(), admin.getPasswordHash())) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }

        admin.setPasswordHash(passwordEncoder.encode(request.getPasswordNueva()));
        admin.setRequiereCambioPassword(false);
        adminUsuarioRepository.save(admin);
    }
}
