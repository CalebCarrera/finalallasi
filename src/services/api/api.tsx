import { Cliente } from "../types/Cliente"

const BASE_URL = "http://localhost:8080/APIRestAllasi"

export async function getClientes(): Promise<Cliente[]> {
    try {
        const res = await fetch(`${BASE_URL}/Cliente`)
        if (!res.ok) throw new Error("No se pudo obtener la lista de clientes")
        return await res.json()
    } catch (error) {
        console.error("Error en getClientes:", error)
        return []
    }
}

export async function getById(info: string, id: number): Promise<Cliente | null> {
    try {
        const res = await fetch(`${BASE_URL}/${info}/${id}`, {
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
        console.error('Error fetching data by ID:', error);
        return null;
    }
}

export async function postCliente(cliente: Omit<Cliente, 'clienteId'>): Promise<Cliente | null> {
    try {
        const res = await fetch(`${BASE_URL}/Cliente`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en postCliente:", error);
        return null;
    }
}

export async function putCliente(cliente: Cliente): Promise<Cliente | null> {
    try {
        const res = await fetch(`${BASE_URL}/Cliente/${cliente.clienteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cliente)
        });

        if (!res.ok) { 
            console.log(res); 
            return null; 
        }

        return await res.json();
    } catch (error) {
        console.error("Error en putCliente:", error);
        return null;
    }
}

export async function deleteCliente(id: number): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_URL}/Cliente/${id}`, {
            method: "DELETE",
        });

        if (!res.ok) { 
            console.log(res); 
            return false; 
        }

        return true;
    } catch (error) {
        console.error("Error en deleteCliente:", error);
        return false;
    }
}