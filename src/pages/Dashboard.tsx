import React from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuth } from '../contexts/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Mock data for stats
  const stats = [
    {
      name: 'Ventas Totales',
      value: '$124,500.00',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-blue-500',
    },
    {
      name: 'Clientes Nuevos',
      value: '45',
      change: '+18.2%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Cobranzas Pendientes',
      value: '$38,250.00',
      change: '-2.4%',
      trend: 'down',
      icon: ShoppingBag,
      color: 'bg-yellow-500',
    },
    {
      name: 'Ingresos Mensuales',
      value: '$42,800.00',
      change: '+8.1%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];
  
  // Mock data for sales chart
  const salesChartData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    datasets: [
      {
        label: 'Ventas 2025',
        data: [18500, 22000, 19500, 24000, 25500, 27000, 24500, 28000, 29500, 32000, 30500, 34000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Ventas 2024',
        data: [15000, 17500, 16800, 19000, 22000, 23500, 21000, 24000, 25500, 27000, 26000, 29000],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };
  
  // Mock data for recent sales
  const recentSales = [
    {
      id: 'VTA-2025-001',
      customer: 'María González',
      product: 'Refrigerador Samsung 500L',
      amount: '$1,299.99',
      status: 'Completada',
      date: '15/05/2025',
    },
    {
      id: 'VTA-2025-002',
      customer: 'Juan Pérez',
      product: 'Lavadora LG 15kg',
      amount: '$899.99',
      status: 'Pendiente',
      date: '14/05/2025',
    },
    {
      id: 'VTA-2025-003',
      customer: 'Ana Rodríguez',
      product: 'Smart TV Sony 55"',
      amount: '$1,099.99',
      status: 'Completada',
      date: '13/05/2025',
    },
    {
      id: 'VTA-2025-004',
      customer: 'Carlos Martínez',
      product: 'Microondas Whirlpool',
      amount: '$249.99',
      status: 'Completada',
      date: '12/05/2025',
    },
    {
      id: 'VTA-2025-005',
      customer: 'Laura Sánchez',
      product: 'Aire Acondicionado Carrier',
      amount: '$799.99',
      status: 'Pendiente',
      date: '11/05/2025',
    },
  ];
  
  // Mock data for pending payments
  const pendingPayments = [
    {
      id: 'COB-2025-001',
      customer: 'Pedro Ramírez',
      amount: '$350.00',
      dueDate: '20/05/2025',
      installment: '3 de 6',
    },
    {
      id: 'COB-2025-002',
      customer: 'Sofía López',
      amount: '$280.00',
      dueDate: '22/05/2025',
      installment: '2 de 12',
    },
    {
      id: 'COB-2025-003',
      customer: 'Miguel Torres',
      amount: '$420.00',
      dueDate: '25/05/2025',
      installment: '5 de 8',
    },
    {
      id: 'COB-2025-004',
      customer: 'Lucía Fernández',
      amount: '$190.00',
      dueDate: '28/05/2025',
      installment: '4 de 6',
    },
    {
      id: 'COB-2025-005',
      customer: 'Roberto Díaz',
      amount: '$310.00',
      dueDate: '30/05/2025',
      installment: '6 de 10',
    },
  ];
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Bienvenido, {user?.name}. Aquí tienes un resumen de la actividad reciente.
        </p>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm flex items-center">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {stat.change}
                </span>
                <span className="ml-2 text-gray-500">desde el mes pasado</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Ventas Mensuales
            </h3>
            <div className="mt-2 h-64">
              <Line data={salesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Ventas Recientes
              </h3>
              <a
                href="/ventas"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Ver todas
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Monto
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estado
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {sale.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {sale.customer}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {sale.amount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sale.status === 'Completada'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {sale.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pending Payments */}
      <div className="mt-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Cobranzas Pendientes
              </h3>
              <a
                href="/cobranzas"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Ver todas
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      ID
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cliente
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Monto
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Vencimiento
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cuota
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {payment.id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {payment.customer}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {payment.amount}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {payment.dueDate}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {payment.installment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;