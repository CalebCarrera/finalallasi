export interface Entrenamiento {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: string; // "Musculación", "Cardio", "Yoga", "CrossFit", etc.
  duracion: number; // en minutos
  nivel: string; // "Principiante", "Intermedio", "Avanzado"
  capacidadMaxima: number;
  precio: number;
  entrenadorId: number;
  entrenadorNombre: string;
  active: boolean;
}

export interface EntrenamientoFormData {
  nombre: string;
  descripcion: string;
  tipo: string;
  duracion: number;
  nivel: string;
  capacidadMaxima: number;
  precio: number;
  entrenadorId: number;
} 