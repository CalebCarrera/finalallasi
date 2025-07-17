// src/types/cliente.ts
export interface Cliente {
  clienteId: number
  nombres: string
  apellidos: string
  dni: string
  correo: string
  telefono: string
  fechaInicio: string
  fechaFin: string
  faltas: number
  planId: number
}

// Interface for UI client data (mapped from API response)
export interface ClienteUI {
  id: number
  name: string
  email: string
  dni: string
  telefono: string
  fechaInicio: string
  fechaFin: string
  faltas: number
  planId: number
  active?: boolean // Optional for UI state management
}
