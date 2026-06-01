import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  private apiUrl = 'http://localhost:2100/stock';

  constructor(private http: HttpClient) {}

  listarStock(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.apiUrl);
  }

  buscarPorProductoId(productoId: number): Observable<Stock> {
    return this.http.get<Stock>(`${this.apiUrl}/${productoId}`);
  }

  actualizarCantidad(productoId: number, cantidad: number): Observable<Stock> {
    return this.http.put<Stock>(`${this.apiUrl}/${productoId}`, { cantidad });
  }
}