import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {

  formulario: FormGroup;
  errorLogin = '';
  ocultarContrasena = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.formulario = this.fb.group({
      nombreUsuario: ['', Validators.required],
      contrasena: ['', Validators.required]
    });
  }

  iniciarSesion(): void {
    if (this.formulario.invalid) return;

    this.authService.iniciarSesion(this.formulario.value).subscribe({
      next: (respuesta) => {
        this.authService.guardarToken(respuesta.token);
        this.authService.guardarRoles(respuesta.roles);
        this.authService.guardarIdUsuario(respuesta.idUsuario);
        this.authService.guardarNombreUsuario(respuesta.nombreUsuario);

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorLogin = 'Usuario o contraseña incorrectos.';
      }
    });
  }
}