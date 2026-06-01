import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  nombreUsuario: string;
  contrasena: string;
}

interface LoginResponse {
  token: string;
  tipo: string;
  nombreUsuario: string;
  roles: string[];
  idUsuario: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:2100/api/autenticacion';

  constructor(private http: HttpClient) { }

  iniciarSesion(datos: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/iniciar-sesion`, datos);
  }

  guardarToken(token: string): void {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  cerrarSesion(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('idUsuario');
    localStorage.removeItem('nombreUsuario');
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  guardarRoles(roles: string[]): void {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  obtenerRoles(): string[] {
    const roles = localStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  tieneRol(rol: string): boolean {
    return this.obtenerRoles().includes(rol);
  }

  esAdmin(): boolean {
    return this.tieneRol('ADMIN') || this.tieneRol('ADMINISTRADOR');
  }

  esVendedor(): boolean {
    return this.tieneRol('VENDEDOR');
  }

  guardarIdUsuario(idUsuario: number): void {
    localStorage.setItem('idUsuario', idUsuario.toString());
  }

  obtenerIdUsuario(): number | null {
    const idUsuario = localStorage.getItem('idUsuario');
    return idUsuario ? Number(idUsuario) : null;
  }

  guardarNombreUsuario(nombreUsuario: string): void {
    localStorage.setItem('nombreUsuario', nombreUsuario);
  }

  obtenerNombreUsuario(): string | null {
    return localStorage.getItem('nombreUsuario');
  }
}