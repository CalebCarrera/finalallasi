export interface Local {
  id: number;
  nombre: string;
  direccion: string;
  distrito: string;
  telefono: string;
  capacidad: number;
  horarioApertura: string;
  horarioCierre: string;
  estado: string; // "Activo", "Mantenimiento", "Cerrado"
  encargado: string;
  active: boolean;
}

export interface LocalFormData {
  nombre: string;
  direccion: string;
  distrito: string;
  telefono: string;
  capacidad: number;
  horarioApertura: string;
  horarioCierre: string;
  estado: string;
  encargado: string;
} 