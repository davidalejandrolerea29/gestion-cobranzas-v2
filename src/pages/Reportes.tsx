import React, { useState, useEffect } from 'react';
// import { MOCK_SALES } from './Ventas';
import { format, parseISO, getMonth, getYear } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formatear fechas en español

const ReportesVentas: React.FC = () => {
  const [ventasPorMes, setVentasPorMes] = useState<{ mes: string; total: number }[]>([]);
  const [productosMasVendidos, setProductosMasVendidos] = useState<{ nombre: string; cantidad: number }[]>([]);

  useEffect(() => {
    generarReportes();
  }, []);

  const generarReportes = () => {
    generarVentasPorMes();
    generarProductosMasVendidos();
  };

  const generarVentasPorMes = () => {
    const ventasMensuales: { [key: string]: number } = {};
/*
    MOCK_SALES.forEach((venta) => {
      const fecha = parseISO(venta.date);
      const mes = format(fecha, 'MMMM yyyy', { locale: es }); // Formato: "Mes Año"

      if (ventasMensuales[mes]) {
        ventasMensuales[mes] += venta.total;
      } else {
        ventasMensuales[mes] = venta.total;
      }
    });
*/
    const resultado = Object.keys(ventasMensuales).map((mes) => ({
      mes,
      total: ventasMensuales[mes],
    }));

    setVentasPorMes(resultado);
  };

  const generarProductosMasVendidos = () => {
    const conteoProductos: { [key: string]: number } = {};
/*
    MOCK_SALES.forEach((venta) => {
      venta.products.forEach((producto) => {
        if (conteoProductos[producto.name]) {
          conteoProductos[producto.name] += producto.quantity;
        } else {
          conteoProductos[producto.name] = producto.quantity;
        }
      });
    });
*/
    const resultado = Object.keys(conteoProductos)
      .map((nombre) => ({
        nombre,
        cantidad: conteoProductos[nombre],
      }))
      .sort((a, b) => b.cantidad - a.cantidad); // Ordenar de mayor a menor

    setProductosMasVendidos(resultado);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Reportes de Ventas</h2>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Total de Ventas por Mes</h3>
        <ul>
          {ventasPorMes.map((venta) => (
            <li key={venta.mes} className="mb-1">
              {venta.mes}: ${venta.total.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Productos Más Vendidos</h3>
        <ul>
          {productosMasVendidos.map((producto) => (
            <li key={producto.nombre} className="mb-1">
              {producto.nombre}: {producto.cantidad} unidades
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReportesVentas;
