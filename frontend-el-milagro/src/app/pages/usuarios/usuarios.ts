import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Usuario } from '../../models/usuario';
import { UsuarioService } from '../../services/usuario';
import { UsuarioFormulario } from './usuario-formulario/usuario-formulario';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss'
})
export class UsuariosComponent implements OnInit, AfterViewInit {

  columnas: string[] = ['id', 'nombreUsuario', 'roles', 'estado', 'acciones'];

  dataSource = new MatTableDataSource<Usuario>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usuarioService: UsuarioService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.obtenerUsuarios();

    this.dataSource.filterPredicate = (usuario: Usuario, filtro: string) => {
      const roles = usuario.roles.map(rol => rol.nombre).join(' ');
      const texto = `${usuario.id} ${usuario.nombreUsuario} ${roles}`.toLowerCase();
      return texto.includes(filtro);
    };

    this.dataSource.sortingDataAccessor = (usuario: Usuario, propiedad: string) => {
      switch (propiedad) {
        case 'id':
          return usuario.id ?? 0;
        case 'nombreUsuario':
          return usuario.nombreUsuario.toLowerCase();
        case 'roles':
          return usuario.roles.map(rol => rol.nombre).join(', ').toLowerCase();
        case 'estado':
          return usuario.esActivo ? 1 : 0;
        default:
          return '';
      }
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => {
        this.dataSource.data = data;
      },
      error: (error) => {
        console.error('Error al obtener usuarios', error);
      }
    });
  }

  aplicarFiltro(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.dataSource.filter = valor.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  agregarUsuario(): void {
    const dialogRef = this.dialog.open(UsuarioFormulario, {
      width: '700px',
      data: {
        modo: 'crear',
        usuario: null
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === 'creado') {
        this.obtenerUsuarios();
        this.mostrarMensaje('Usuario agregado con éxito');
      }
    });
  }

  verUsuario(usuario: Usuario): void {
    this.dialog.open(UsuarioFormulario, {
      width: '700px',
      data: {
        modo: 'ver',
        usuario
      }
    });
  }

  editarUsuario(usuario: Usuario): void {
    const dialogRef = this.dialog.open(UsuarioFormulario, {
      width: '700px',
      data: {
        modo: 'editar',
        usuario
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === 'editado') {
        this.obtenerUsuarios();
        this.mostrarMensaje('Usuario editado con éxito');
      }
    });
  }

  eliminarUsuario(usuario: Usuario): void {
    const confirmar = confirm(
      `¿Desea eliminar el usuario ${usuario.nombreUsuario}?`
    );

    if (!confirmar || usuario.id == null) return;

    this.usuarioService.eliminarUsuario(usuario.id).subscribe({
      next: () => {
        this.obtenerUsuarios();
        this.mostrarMensaje('Usuario eliminado con éxito');
      },
      error: (error) => {
        console.error('Error al eliminar usuario', error);
      }
    });
  }

  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-exito']
    });
  }

  obtenerRolesTexto(usuario: Usuario): string {
    return usuario.roles.map(rol => rol.nombre).join(', ');
  }
}