export interface Reserva {
  id: number;
  clienteId: number;
  clienteNombre: string;
  entrenamientoId: number;
  entrenamientoNombre: string;
  localId: number;
  localNombre: string;
  fecha: string;
  hora: string;
  estado: string; // "Confirmada", "Pendiente", "Cancelada", "Completada"
  precio: number;
  fechaReserva: string; // fecha cuando se hizo la reserva
  active: boolean;
}

export interface ReservaFormData {
  clienteId: number;
  entrenamientoId: number;
  localId: number;
  fecha: string;
  hora: string;
  estado: string;
  precio: number;
} 