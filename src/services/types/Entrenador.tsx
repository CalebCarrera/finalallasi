export interface Entrenador {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  especialidad: string;
  experiencia: number; // años de experiencia
  fechaContratacion: string;
  salario: number;
  active: boolean;
}

export interface EntrenadorFormData {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono: string;
  especialidad: string;
  experiencia: number;
  fechaContratacion: string;
  salario: number;
} 