import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';

import { Producto } from '../../../models/producto';
import { Proveedor } from '../../../models/proveedor';
import { ProductoService } from '../../../services/producto';
import { ProveedorService } from '../../../services/proveedor';

@Component({
  selector: 'app-producto-formulario',
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
  templateUrl: './producto-formulario.html',
  styleUrl: './producto-formulario.scss'
})
export class ProductoFormulario implements OnInit {

  formulario!: FormGroup;
  proveedores: Proveedor[] = [];

  modo: 'crear' | 'editar' | 'ver';

  constructor(
    private fb: FormBuilder,
    private productoService: ProductoService,
    private proveedorService: ProveedorService,
    private dialogRef: MatDialogRef<ProductoFormulario>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      modo: 'crear' | 'editar' | 'ver',
      producto: Producto
    }
  ) {
    this.modo = data.modo;
  }

  ngOnInit(): void {
    this.formulario = this.fb.group({
      id: [''],
      nombreProducto: ['', Validators.required],
      precioProducto: ['', [Validators.required, Validators.min(0.01)]],
      proveedorId: ['', Validators.required],
      cantidadInicial: ['']
    });

    if (this.modo === 'crear') {
      this.formulario.get('cantidadInicial')?.setValidators([
        Validators.required,
        Validators.min(0)
      ]);
      this.formulario.get('cantidadInicial')?.updateValueAndValidity();
    }

    if (this.data.producto) {
      this.formulario.patchValue({
        id: this.data.producto.id,
        nombreProducto: this.data.producto.nombreProducto,
        precioProducto: this.data.producto.precioProducto,
        proveedorId: this.data.producto.proveedor?.id
      });

      this.proveedores = [this.data.producto.proveedor];
    }

    if (this.modo === 'ver') {
      this.formulario.disable();
    }

    if (this.modo !== 'ver') {
      this.cargarProveedores();
    }
  }

  cargarProveedores(): void {
    this.proveedorService.listarProveedores().subscribe({
      next: (proveedores) => {
        this.proveedores = proveedores.filter(p => p.esActivo);
      },
      error: (error) => {
        console.error('Error al cargar proveedores', error);
      }
    });
  }

  guardar(): void {
    if (this.formulario.invalid) return;

    const valores = this.formulario.getRawValue();

    const proveedorSeleccionado = this.proveedores.find(
      proveedor => proveedor.id === valores.proveedorId
    );

    if (!proveedorSeleccionado) return;

    const producto: Producto = {
      id: valores.id,
      nombreProducto: valores.nombreProducto,
      precioProducto: Number(valores.precioProducto),
      proveedor: proveedorSeleccionado,
      esActivo: true,
      cantidadInicial: this.modo === 'crear'
        ? Number(valores.cantidadInicial)
        : undefined
    };

    if (this.modo === 'crear') {
      this.productoService.registrarProducto(producto).subscribe(() => {
        this.dialogRef.close('creado');
      });
    }

    if (this.modo === 'editar' && producto.id != null) {
      this.productoService.actualizarProducto(producto.id, producto).subscribe(() => {
        this.dialogRef.close('editado');
      });
    }
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}