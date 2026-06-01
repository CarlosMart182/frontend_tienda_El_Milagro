import { Rol } from './rol';

export interface Usuario {
  id?: number;
  nombreUsuario: string;
  esActivo: boolean;
  fechaRegistro?: string;
  fechaModificacion?: string;
  roles: Rol[];
}

export interface UsuarioCrearDto {
  nombreUsuario: string;
  clave: string;
  rolesIds: number[];
}

export interface UsuarioActualizarDto {
  nombreUsuario: string;
  clave?: string;
  rolesIds: number[];
}