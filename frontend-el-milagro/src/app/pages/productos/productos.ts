import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductoFormulario } from './producto-formulario/producto-formulario';
import { AuthService } from '../../services/auth';
import { StockService } from '../../services/stock';

@Component({
  selector: 'app-productos',
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
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class ProductosComponent implements OnInit, AfterViewInit {

  columnas: string[] = ['id', 'nombreProducto', 'proveedor', 'precioProducto', 'stock', 'estado', 'acciones'];

  dataSource = new MatTableDataSource<Producto>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  stockPorProducto: { [productoId: number]: number } = {};

  constructor(private productoService: ProductoService,
    private stockService: StockService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.obtenerProductos();

    this.dataSource.filterPredicate = (producto: Producto, filtro: string) => {
      const texto = `
        ${producto.id}
        ${producto.nombreProducto}
        ${producto.proveedor?.nombreProveedor ?? ''}
        ${producto.precioProducto}
      `.toLowerCase();

      return texto.includes(filtro);
    };

    this.dataSource.sortingDataAccessor = (producto: Producto, propiedad: string) => {
      switch (propiedad) {
        case 'id':
          return producto.id ?? 0;
        case 'nombreProducto':
          return producto.nombreProducto?.toLowerCase() ?? '';
        case 'proveedor':
          return producto.proveedor?.nombreProveedor?.toLowerCase() ?? '';
        case 'precioProducto':
          return producto.precioProducto ?? 0;
        case 'estado':
          return producto.esActivo ? 1 : 0;
        default:
          return '';
      }
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  obtenerProductos(): void {
    this.productoService.listarProductos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.cargarStockProductos(data);
      },
      error: (error) => {
        console.error('Error al obtener productos', error);
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

  cargarStockProductos(productos: Producto[]): void {
    this.stockPorProducto = {};

    productos.forEach(producto => {
      if (producto.id == null) return;

      this.stockService.buscarPorProductoId(producto.id).subscribe({
        next: (stock) => {
          this.stockPorProducto[producto.id!] = stock.cantidad;
        },
        error: () => {
          this.stockPorProducto[producto.id!] = 0;
        }
      });
    });
  }

  agregarProducto(): void {
    const dialogRef = this.dialog.open(ProductoFormulario, {
      width: '700px',
      data: {
        modo: 'crear',
        producto: null
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === 'creado') {
        this.obtenerProductos();
        this.mostrarMensaje('Producto agregado con éxito');
      }
    });
  }

  verProducto(producto: Producto): void {
    this.dialog.open(ProductoFormulario, {
      width: '700px',
      data: {
        modo: 'ver',
        producto
      }
    });
  }

  editarProducto(producto: Producto): void {
    const dialogRef = this.dialog.open(ProductoFormulario, {
      width: '700px',
      data: {
        modo: 'editar',
        producto
      }
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado === 'editado') {
        this.obtenerProductos();
        this.mostrarMensaje('Producto editado con éxito');
      }
    });
  }

  eliminarProducto(producto: Producto): void {
    const confirmar = confirm(
      `¿Desea eliminar el producto ${producto.nombreProducto}?`
    );

    if (!confirmar || producto.id == null) return;

    this.productoService.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.obtenerProductos();
        this.mostrarMensaje('Producto eliminado con éxito');
      },
      error: (error) => {
        console.error('Error al eliminar producto', error);
      }
    });
  }

  editarStock(producto: Producto): void {
    if (producto.id == null) return;

    const stockActual = this.stockPorProducto[producto.id] ?? 0;

    const nuevoStock = prompt(
      `Ingrese la nueva cantidad de stock para ${producto.nombreProducto}:`,
      stockActual.toString()
    );

    if (nuevoStock === null) return;

    const cantidad = Number(nuevoStock);

    if (isNaN(cantidad) || cantidad < 0) {
      this.mostrarMensaje('La cantidad debe ser mayor o igual a 0');
      return;
    }

    this.stockService.actualizarCantidad(producto.id, cantidad).subscribe({
      next: () => {
        this.stockPorProducto[producto.id!] = cantidad;
        this.mostrarMensaje('Stock actualizado con éxito');
      },
      error: (error) => {
        console.error('Error al actualizar stock', error);
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
}