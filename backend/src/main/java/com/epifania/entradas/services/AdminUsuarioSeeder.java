package com.epifania.entradas.services;

import com.epifania.entradas.models.AdminUsuario;
import com.epifania.entradas.repositories.AdminUsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Crea el admin inicial en el primer arranque, si no existe ninguno, a partir
 * de las variables de entorno ADMIN_DEFAULT_EMAIL / ADMIN_DEFAULT_PASSWORD.
 * Queda marcado con requiereCambioPassword=true para forzar el cambio.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminUsuarioSeeder implements ApplicationRunner {

    private final AdminUsuarioRepository adminUsuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.default-email:}")
    private String defaultEmail;

    @Value("${app.admin.default-password:}")
    private String defaultPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminUsuarioRepository.count() > 0) {
            return;
        }
        if (defaultEmail.isBlank() || defaultPassword.isBlank()) {
            log.warn("No hay administradores y no se definieron ADMIN_DEFAULT_EMAIL/ADMIN_DEFAULT_PASSWORD; "
                    + "no se pudo crear un admin inicial.");
            return;
        }

        AdminUsuario admin = AdminUsuario.builder()
                .email(defaultEmail.trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(defaultPassword))
                .requiereCambioPassword(true)
                .build();
        adminUsuarioRepository.save(admin);
        log.info("Admin inicial creado para {}", admin.getEmail());
    }
}
