export interface Reserva {
  reservaId: number;
  asistencia: boolean | null;
  fechaReserva: string; // ISO datetime string

  cliente: {
    clienteId: number;
    nombres: string;
    apellidos: string;
    dni: string;
    correo: string;
    telefono: string;
    fechaInicio: string;
    fechaFin: string;
    faltas: number;
    planId: number;
  };

  entrenamiento: {
    entrenamientoId: number;
    tipo: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    maxParticipantes: number;
    descripcion: string;
    informe: string | null;

    local: {
      id: number;
      nombre: string;
      direccion: string;
      tipo: string;
      capacidad: number;
      estado: boolean;
    };

    entrenador: {
      id: number;
      nombres: string;
      apellidos: string;
      dni: string;
      correo: string;
      telefono: string;
      especialidad: string;
      estado: boolean;
    };
  };

  nombreCliente: string;
  apellidoCliente: string;
}
