import { Local } from "@/services/types/Local"

const BASE_URL = "http://localhost:8080/APIRestAllasi"

export async function getLocales(): Promise<Local[]> {
    try {
        const res = await fetch(`${BASE_URL}/Local`)
        if (!res.ok) throw new Error("No se pudo obtener la lista de Locales")
        return await res.json()
    } catch (error) {
        console.error("Error en getlocales:", error)
        return []
    }
}

export async function getLocalById(id: number): Promise<Local | null> {
    try {
        const res = await fetch(`${BASE_URL}/Local/${id}`, {
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
        console.error('Error fetching Local by ID:', error);
        return null;
    }
}

export async function postLocal(Local: Omit<Local, 'id'>): Promise<Local | null> {
    try {
        const res = await fetch(`${BASE_URL}/Local`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Local)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en postLocal:", error);
        return null;
    }
}

export async function putLocal(Local: Local): Promise<Local | null> {
    try {
        const res = await fetch(`${BASE_URL}/Local/${Local.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(Local)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en putLocal:", error);
        return null;
    }
}

export async function deleteLocal(id: number): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/Local/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) { 
            console.log(res); 
            return false; 
        }

        return true;
    } catch (error) {
        console.error("Error en deleteLocal:", error);
        return false;
    }
}