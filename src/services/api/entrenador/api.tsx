import { Entrenador } from "@/services/types/Entrenador"

const BASE_URL = "http://localhost:8080/APIRestAllasi"

export async function getEntrenadores(): Promise<Entrenador[]> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenador`)
        if (!res.ok) throw new Error("No se pudo obtener la lista de entrenadores")
        return await res.json()
    } catch (error) {
        console.error("Error en getEntrenadores:", error)
        return []
    }
}

export async function getEntrenadorById(id: number): Promise<Entrenador | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenador/${id}`, {
            method: "GET",
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        const data = await res.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching entrenador by ID:', error);
        return null;
    }
}

export async function postEntrenador(entrenador: Omit<Entrenador, 'id'>): Promise<Entrenador | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenador`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entrenador)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en postEntrenador:", error);
        return null;
    }
}

export async function putEntrenador(entrenador: Entrenador): Promise<Entrenador | null> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenador/${entrenador.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entrenador)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en putEntrenador:", error);
        return null;
    }
}

export async function deleteEntrenador(id: number): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/Entrenador/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) { 
            console.log(res); 
            return false; 
        }

        return true;
    } catch (error) {
        console.error("Error en deleteEntrenador:", error);
        return false;
    }
}