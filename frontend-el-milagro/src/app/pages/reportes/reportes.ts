import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { FacturaService } from '../../services/factura';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.scss'
})
export class Reportes {

  mes = new Date().getMonth() + 1;
  anio = new Date().getFullYear();

  reporte: any = null;

  constructor(
    private facturaService: FacturaService,
    private snackBar: MatSnackBar
  ) {}

  generarReporte(): void {
    this.facturaService.generarReporteMensual(this.mes, this.anio).subscribe({
      next: data => {
        this.reporte = data;
      },
      error: error => {
        console.error('Error al generar reporte', error);
        this.mostrarMensaje('Error al generar reporte mensual');
      }
    });
  }

  descargarPdf(): void {
    this.facturaService.generarReporteMensualPdf(this.mes, this.anio).subscribe({
      next: blob => {
        this.descargarArchivo(blob, `reporte_${this.mes}_${this.anio}.pdf`);
      },
      error: error => {
        console.error('Error al descargar PDF', error);
        this.mostrarMensaje('Error al descargar PDF');
      }
    });
  }

  descargarExcel(): void {
    this.facturaService.generarReporteMensualExcel(this.mes, this.anio).subscribe({
      next: blob => {
        this.descargarArchivo(blob, `reporte_${this.mes}_${this.anio}.xlsx`);
      },
      error: error => {
        console.error('Error al descargar Excel', error);
        this.mostrarMensaje('Error al descargar Excel');
      }
    });
  }

  private descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');

    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();

    window.URL.revokeObjectURL(url);
  }

  private mostrarMensaje(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['snackbar-exito']
    });
  }
}