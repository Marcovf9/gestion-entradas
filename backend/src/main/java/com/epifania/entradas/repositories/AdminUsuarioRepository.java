package com.epifania.entradas.repositories;

import com.epifania.entradas.models.AdminUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminUsuarioRepository extends JpaRepository<AdminUsuario, Long> {
    Optional<AdminUsuario> findByEmail(String email);
}
