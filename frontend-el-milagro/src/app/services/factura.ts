import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Factura, DetalleFactura } from '../models/factura';

@Injectable({
    providedIn: 'root'
})
export class FacturaService {

    private apiUrl = 'http://localhost:2100/facturas';

    constructor(private http: HttpClient) { }

    generarFactura(factura: Factura): Observable<Factura> {
        return this.http.post<Factura>(`${this.apiUrl}/generar`, factura);
    }

    consultarFacturas(fechaInicio?: string, fechaFin?: string, cliente?: string): Observable<Factura[]> {
        let params = new HttpParams();

        if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
        if (fechaFin) params = params.set('fechaFin', fechaFin);
        if (cliente) params = params.set('cliente', cliente);

        return this.http.get<Factura[]>(`${this.apiUrl}/consultar`, { params });
    }

    consultarPorId(idFactura: string): Observable<Factura> {
        return this.http.get<Factura>(`${this.apiUrl}/consultar/${idFactura}`);
    }

    consultarDetalles(idFactura: string): Observable<DetalleFactura[]> {
        return this.http.get<DetalleFactura[]>(`${this.apiUrl}/consultar/${idFactura}/detalles`);
    }

    generarReporteMensual(mes: number, anio: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/reporte-mensual`, {
            params: {
                mes,
                anio
            }
        });
    }

    generarReporteMensualPdf(mes: number, anio: number) {
        return this.http.get(`${this.apiUrl}/reporte-mensual/pdf`, {
            params: { mes, anio },
            responseType: 'blob'
        });
    }

    generarReporteMensualExcel(mes: number, anio: number) {
        return this.http.get(`${this.apiUrl}/reporte-mensual/excel`, {
            params: { mes, anio },
            responseType: 'blob'
        });
    }
}