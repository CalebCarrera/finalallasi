export interface Entrenamiento {
  entrenamientoId?: number; // Opcional porque es generado automáticamente
  tipo?: string;
  fecha: string; // ISO format (yyyy-MM-dd)
  horaInicio: string; // formato HH:mm:ss
  horaFin: string;    // formato HH:mm:ss
  local?: {
    id: number;
    nombre: string;
    direccion: string;
    tipo: string;
    capacidad: number;
    estado: boolean;
  } | null;
  entrenador?: {
    id: number;
    nombres: string;
    apellidos: string;
    dni: string;
    correo: string;
    telefono: string;
    especialidad: string;
    estado: boolean;
  } | null;
  maxParticipantes?: number;
  descripcion?: string;
  informe?: string | null;
}
