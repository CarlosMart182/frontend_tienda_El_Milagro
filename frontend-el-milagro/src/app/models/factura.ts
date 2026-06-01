import { Cliente } from './cliente';
import { Producto } from './producto';

export interface DetalleFactura {
  id?: number;
  producto: Producto;
  cantidad: number;
  precioUnitario?: number;
  costo?: number;
}

export interface Factura {
  id?: string;
  usuario: {
    id: number;
  };
  cliente: Cliente;
  fecha?: string;
  subtotal?: number;
  iva?: number;
  total?: number;
  fechaRegistro?: string;
  fechaModificacion?: string;
  detalles: DetalleFactura[];
}