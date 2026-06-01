import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Usuario } from '../../../models/usuario';
import { Rol } from '../../../models/rol';
import { UsuarioService } from '../../../services/usuario';

@Component({
  selector: 'app-usuario-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  templateUrl: './usuario-formulario.html',
  styleUrl: './usuario-formulario.scss'
})
export class UsuarioFormulario implements OnInit {

  formulario!: FormGroup;
  roles: Rol[] = [];
  modo: 'crear' | 'editar' | 'ver';

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private dialogRef: MatDialogRef<UsuarioFormulario>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      modo: 'crear' | 'editar' | 'ver',
      usuario: Usuario | null
    }
  ) {
    this.modo = data.modo;
  }

  ngOnInit(): void {
    this.formulario = this.fb.group({
      id: [''],
      nombreUsuario: ['', Validators.required],
      clave: [''],
      rolesIds: [[], Validators.required]
    });

    if (this.modo === 'crear') {
      this.formulario.get('clave')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.formulario.get('clave')?.updateValueAndValidity();
    }

    this.cargarRoles();
  }

  cargarRoles(): void {
    this.usuarioService.listarRoles().subscribe({
      next: (roles) => {
        this.roles = roles;

        if (this.data.usuario) {
          this.formulario.patchValue({
            id: this.data.usuario.id,
            nombreUsuario: this.data.usuario.nombreUsuario,
            rolesIds: this.data.usuario.roles.map(rol => rol.id)
          });
        }

        if (this.modo === 'ver') {
          this.formulario.disable();
        }
      },
      error: (error) => {
        console.error('Error al cargar roles', error);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();

    if (this.modo === 'crear') {
      this.usuarioService.registrarUsuario({
        nombreUsuario: valores.nombreUsuario,
        clave: valores.clave,
        rolesIds: valores.rolesIds
      }).subscribe(() => {
        this.dialogRef.close('creado');
      });
    }

    if (this.modo === 'editar' && this.data.usuario?.id != null) {
      const dto: any = {
        nombreUsuario: valores.nombreUsuario,
        rolesIds: valores.rolesIds
      };

      if (valores.clave && valores.clave.trim() !== '') {
        dto.clave = valores.clave;
      }

      this.usuarioService.actualizarUsuario(this.data.usuario.id, dto).subscribe(() => {
        this.dialogRef.close('editado');
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}