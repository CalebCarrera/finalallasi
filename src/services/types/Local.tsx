export interface Local {
  id: number;
  nombre: string;
  direccion: string;
  tipo: string;
  capacidad: number;
  estado: boolean;
}

export interface LocalFormData {
  nombre: string;
  direccion: string;
  tipo: string;
  capacidad: number;
  estado: boolean;
} 