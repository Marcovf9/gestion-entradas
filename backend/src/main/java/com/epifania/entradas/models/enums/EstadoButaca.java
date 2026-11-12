package com.epifania.entradas.models.enums;

public enum EstadoButaca {
    DISPONIBLE,
    RESERVADA,
    VENDIDA,
    /** Butaca que existe en el plano pero no se vende (ej. las junto a la cabina). */
    BLOQUEADA
}
