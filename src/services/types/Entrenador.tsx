export interface Entrenador {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  especialidad: string;
  estado: boolean;
}

// Interface for UI entrenador data (mapped from API response)
export interface EntrenadorUI {
  id: number;
  name: string;
  email: string;
  dni: string;
  telefono: string;
  especialidad: string;
  active: boolean;
}

export interface EntrenadorFormData {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  especialidad: string;
} 