package com.epifania.entradas.exception;

import lombok.Getter;

import java.util.List;

@Getter
public class ConflictoReservaException extends RuntimeException {

    private final List<Long> conflictSeatIds;

    public ConflictoReservaException(String mensaje, List<Long> conflictSeatIds) {
        super(mensaje);
        this.conflictSeatIds = conflictSeatIds;
    }
}
