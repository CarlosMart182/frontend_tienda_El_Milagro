import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Cliente } from '../../models/cliente';
import { Producto } from '../../models/producto';
import { Factura, DetalleFactura } from '../../models/factura';

import { ClienteService } from '../../services/cliente';
import { ProductoService } from '../../services/producto';
import { StockService } from '../../services/stock';
import { FacturaService } from '../../services/factura';
import { AuthService } from '../../services/auth';
import { MatTabsModule } from '@angular/material/tabs';

interface DetalleTemporal {
  producto: Producto;
  cantidad: number;
  precioUnitario: number;
  stockDisponible: number;
  subtotal: number;
}

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './facturacion.html',
  styleUrl: './facturacion.scss'
})
export class Facturacion implements OnInit {

  clientes: Cliente[] = [];
  productos: Producto[] = [];

  clienteSeleccionado: Cliente | null = null;
  productoSeleccionado: Producto | null = null;
  cantidad = 1;
  fechaInicioConsulta = '';
  fechaFinConsulta = '';
  clienteConsulta = '';
  idFacturaConsulta = '';

  facturasConsultadas: Factura[] = [];
  facturaSeleccionada: Factura | null = null;
  detallesFacturaSeleccionada: DetalleFactura[] = [];

  stockPorProducto: { [productoId: number]: number } = {};
  detalles: DetalleTemporal[] = [];

  ivaPorcentaje = 0.13;

  constructor(
    private clienteService: ClienteService,
    private productoService: ProductoService,
    private stockService: StockService,
    private facturaService: FacturaService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarProductos();
  }

  cargarClientes(): void {
    this.clienteService.listarClientes().subscribe({
      next: data => this.clientes = data.filter(c => c.esActivo),
      error: error => console.error('Error al cargar clientes', error)
    });
  }

  cargarProductos(): void {
    this.productoService.listarProductos().subscribe({
      next: data => {
        this.productos = data.filter(p => p.esActivo);
        this.cargarStocks();
      },
      error: error => console.error('Error al cargar productos', error)
    });
  }

  cargarStocks(): void {
    this.productos.forEach(producto => {
      if (producto.id == null) return;

      this.stockService.buscarPorProductoId(producto.id).subscribe({
        next: stock => {
          this.stockPorProducto[producto.id!] = stock.cantidad;
        },
        error: () => {
          this.stockPorProducto[producto.id!] = 0;
        }
      });
    });
  }

  agregarProducto(): void {
    if (!this.productoSeleccionado || this.productoSeleccionado.id == null) {
      this.mostrarMensaje('Seleccione un producto');
      return;
    }

    if (!this.cantidad || this.cantidad < 1) {
      this.mostrarMensaje('La cantidad debe ser mayor o igual a 1');
      return;
    }

    const stockDisponible = this.stockPorProducto[this.productoSeleccionado.id] ?? 0;

    if (this.cantidad > stockDisponible) {
      this.mostrarMensaje('Stock insuficiente');
      return;
    }

    const yaExiste = this.detalles.some(
      d => d.producto.id === this.productoSeleccionado?.id
    );

    if (yaExiste) {
      this.mostrarMensaje('El producto ya fue agregado');
      return;
    }

    const precio = Number(this.productoSeleccionado.precioProducto);

    this.detalles.push({
      producto: this.productoSeleccionado,
      cantidad: this.cantidad,
      precioUnitario: precio,
      stockDisponible,
      subtotal: precio * this.cantidad
    });

    this.productoSeleccionado = null;
    this.cantidad = 1;
  }

  eliminarDetalle(index: number): void {
    this.detalles.splice(index, 1);
  }

  get subtotal(): number {
    return this.detalles.reduce((total, item) => total + item.subtotal, 0);
  }

  get iva(): number {
    return this.subtotal * this.ivaPorcentaje;
  }

  get total(): number {
    return this.subtotal + this.iva;
  }

  generarFactura(): void {
    const idUsuario = this.authService.obtenerIdUsuario();

    if (!idUsuario) {
      this.mostrarMensaje('No se encontró el usuario autenticado');
      return;
    }

    if (!this.clienteSeleccionado) {
      this.mostrarMensaje('Seleccione un cliente');
      return;
    }

    if (this.detalles.length === 0) {
      this.mostrarMensaje('Debe agregar al menos un producto');
      return;
    }

    const factura: Factura = {
      usuario: {
        id: idUsuario
      },
      cliente: {
        dui: this.clienteSeleccionado.dui
      } as Cliente,
      fecha: new Date().toISOString().split('T')[0],
      detalles: this.detalles.map(item => ({
        producto: {
          id: item.producto.id
        } as Producto,
        cantidad: item.cantidad
      } as DetalleFactura))
    };

    this.facturaService.generarFactura(factura).subscribe({
      next: respuesta => {
        this.mostrarMensaje(`Factura ${respuesta.id} generada con éxito`);
        this.limpiarFormulario();
        this.cargarProductos();
      },
      error: error => {
        console.error('Error al generar factura', error);
        this.mostrarMensaje(error.error?.error || 'Error al generar factura');
      }
    });
  }

  limpiarFormulario(): void {
    this.clienteSeleccionado = null;
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.detalles = [];
  }

  consultarFacturas(): void {
    this.facturaSeleccionada = null;
    this.detallesFacturaSeleccionada = [];

    this.facturaService.consultarFacturas(
      this.fechaInicioConsulta || undefined,
      this.fechaFinConsulta || undefined,
      this.clienteConsulta || undefined
    ).subscribe({
      next: data => {
        this.facturasConsultadas = data;
      },
      error: error => {
        console.error('Error al consultar facturas', error);
        this.mostrarMensaje('Error al consultar facturas');
      }
    });
  }

  buscarFacturaPorId(): void {
    if (!this.idFacturaConsulta.trim()) {
      this.mostrarMensaje('Ingrese el ID de la factura');
      return;
    }

    this.facturaService.consultarPorId(this.idFacturaConsulta.trim()).subscribe({
      next: factura => {
        this.facturasConsultadas = [factura];
        this.facturaSeleccionada = factura;
        this.consultarDetallesFactura(factura.id!);
      },
      error: error => {
        console.error('Error al buscar factura', error);
        this.mostrarMensaje('Factura no encontrada');
      }
    });
  }

  consultarDetallesFactura(idFactura: string): void {
    this.facturaService.consultarDetalles(idFactura).subscribe({
      next: detalles => {
        this.facturaSeleccionada =
          this.facturasConsultadas.find(f => f.id === idFactura) || null;

        this.detallesFacturaSeleccionada = detalles;
      },
      error: error => {
        console.error('Error al consultar detalle', error);
        this.mostrarMensaje('Error al consultar detalle de factura');
      }
    });
  }

  limpiarConsultaFacturas(): void {
    this.fechaInicioConsulta = '';
    this.fechaFinConsulta = '';
    this.clienteConsulta = '';
    this.idFacturaConsulta = '';
    this.facturasConsultadas = [];
    this.facturaSeleccionada = null;
    this.detallesFacturaSeleccionada = [];
  }

  limpiarBusquedaPorId(): void {
    this.idFacturaConsulta = '';
    this.facturaSeleccionada = null;
    this.detallesFacturaSeleccionada = [];
    this.facturasConsultadas = [];
  }

  mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-exito']
    });
  }
}