import { Entrenamiento } from "../types/Entrenamiento";

const BASE_URL = "http://localhost:8080/APIRestAllasi";

// Obtener todos los entrenamientos
export async function getEntrenamientos(): Promise<Entrenamiento[]> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento`);
        if (!res.ok) throw new Error("No se pudo obtener la lista de entrenamientos");
        return await res.json();
    } catch (error) {
        console.error("Error en getEntrenamientos:", error);
        return [];
    }
}

// Obtener entrenamiento por ID
export async function getEntrenamientoById(id: number): Promise<Entrenamiento | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento/${id}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error en getEntrenamientoById:", error);
        return null;
    }
}

// Buscar entrenamientos por tipo
export async function buscarEntrenamientoPorTipo(tipo: string): Promise<Entrenamiento[]> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento/buscar?tipo=${encodeURIComponent(tipo)}`);
        if (!res.ok) throw new Error("No se pudo buscar los entrenamientos");
        return await res.json();
    } catch (error) {
        console.error("Error en buscarEntrenamientoPorTipo:", error);
        return [];
    }
}

// Crear nuevo entrenamiento
export async function postEntrenamiento(entrenamiento: Omit<Entrenamiento, "entrenamientoId">): Promise<Entrenamiento | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entrenamiento)
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error en postEntrenamiento:", error);
        return null;
    }
}

// Actualizar entrenamiento
export async function putEntrenamiento(entrenamiento: Entrenamiento): Promise<Entrenamiento | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento/${entrenamiento.entrenamientoId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entrenamiento)
        });

        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error en putEntrenamiento:", error);
        return null;
    }
}

// Eliminar entrenamiento
export async function deleteEntrenamiento(id: number): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenamiento/${id}`, {
            method: "DELETE",
        });

        return res.ok;
    } catch (error) {
        console.error("Error en deleteEntrenamiento:", error);
        return false;
    }
}
