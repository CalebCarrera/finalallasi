import { Reserva } from "../types/Reserva"

const BASE_URL = "http://localhost:8080/APIRestAllasi"

// Obtener todas las reservas
export async function getReservas(): Promise<Reserva[]> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva`)
    if (!res.ok) throw new Error("No se pudo obtener la lista de reservas")
    return await res.json()
  } catch (error) {
    console.error("Error en getReservas:", error)
    return []
  }
}

// Obtener reserva por ID
export async function getReservaById(id: number): Promise<Reserva | null> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva/${id}`, {
      method: "GET",
    })

    if (!res.ok) {
      console.log(res)
      return null
    }

    const data = await res.json()
    return data
  } catch (error) {
    console.error("Error en getReservaById:", error)
    return null
  }
}

// Buscar reservas por nombre/apellido del cliente
export async function buscarReservaPorNombreCliente(texto: string): Promise<Reserva[]> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva/buscar?texto=${encodeURIComponent(texto)}`)

    if (!res.ok) {
      console.log(res)
      return []
    }

    return await res.json()
  } catch (error) {
    console.error("Error en buscarReservaPorNombreCliente:", error)
    return []
  }
}

// Crear nueva reserva
export async function postReserva(reserva: Omit<Reserva, 'reservaId'>): Promise<Reserva | null> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reserva)
    })

    if (!res.ok) {
      console.log(res)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Error en postReserva:", error)
    return null
  }
}

// Actualizar reserva
export async function putReserva(reserva: Reserva): Promise<Reserva | null> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva/${reserva.reservaId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reserva)
    })

    if (!res.ok) {
      console.log(res)
      return null
    }

    return await res.json()
  } catch (error) {
    console.error("Error en putReserva:", error)
    return null
  }
}

// Eliminar reserva
export async function deleteReserva(id: number): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/Reserva/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      console.log(res)
      return false
    }

    return true
  } catch (error) {
    console.error("Error en deleteReserva:", error)
    return false
  }
}
