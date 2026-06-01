import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Rol } from '../models/rol';
import {
  Usuario,
  UsuarioCrearDto,
  UsuarioActualizarDto
} from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private usuariosUrl = 'http://localhost:2100/usuarios';
  private rolesUrl = 'http://localhost:2100/roles';

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.usuariosUrl}/listar`);
  }

  registrarUsuario(usuario: UsuarioCrearDto): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.usuariosUrl}/registrar`, usuario);
  }

  actualizarUsuario(id: number, usuario: UsuarioActualizarDto): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.usuariosUrl}/actualizar/${id}`, usuario);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usuariosUrl}/eliminar/${id}`);
  }

  cambiarEstado(id: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.usuariosUrl}/cambiar-estado/${id}`, {});
  }

  listarRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.rolesUrl}/listar`);
  }
}