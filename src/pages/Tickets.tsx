import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Search, 
  Plus, 
  Printer, 
  RefreshCw,
  Filter,
  ArrowUpDown,
  Ticket,
  Download
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

// Form validation schema
const ticketSchema = z.object({
  clientName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
});

type TicketFormData = z.infer<typeof ticketSchema>;

// Mock tickets data
const MOCK_TICKETS = [
  {
    id: 'TKT-2025-001',
    number: '000001',
    clientName: 'María González',
    amount: 5.00,
    date: '2025-05-15T10:30:00',
    seller: 'Vendedor',
    status: 'active',
    printed: true,
    reprints: 0,
  },
  {
    id: 'TKT-2025-002',
    number: '000002',
    clientName: 'Juan Pérez',
    amount: 10.00,
    date: '2025-05-15T11:15:00',
    seller: 'Vendedor',
    status: 'active',
    printed: true,
    reprints: 1,
  },
  {
    id: 'TKT-2025-003',
    number: '000003',
    clientName: 'Ana Rodríguez',
    amount: 5.00,
    date: '2025-05-15T12:00:00',
    seller: 'Administrador',
    status: 'winner',
    printed: true,
    reprints: 0,
  },
];

// Ticket statuses for filter
const TICKET_STATUSES = [
  'Todos',
  'Activos',
  'Ganadores',
  'Anulados',
];

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState(MOCK_TICKETS);
  const [filteredTickets, setFilteredTickets] = useState(MOCK_TICKETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingTicket, setPrintingTicket] = useState<typeof MOCK_TICKETS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_TICKETS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      amount: 5,
      quantity: 1,
    },
  });

  // Handle printing
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      setPrintingTicket(null);
    },
  });

  // Filter tickets based on search term and status
  React.useEffect(() => {
    let result = tickets;
    
    if (searchTerm) {
      result = result.filter(
        ticket =>
          ticket.number.includes(searchTerm) ||
          ticket.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'Todos') {
      const statusMap: Record<string, string> = {
        'Activos': 'active',
        'Ganadores': 'winner',
        'Anulados': 'cancelled',
      };
      result = result.filter(ticket => ticket.status === statusMap[selectedStatus]);
    }
    
    // Apply sorting if configured
    if (sortConfig !== null) {
      result = [...result].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    setFilteredTickets(result);
  }, [tickets, searchTerm, selectedStatus, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_TICKETS[0]) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Open modal for adding new tickets
  const openAddModal = () => {
    reset({
      clientName: '',
      amount: 5,
      quantity: 1,
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: TicketFormData) => {
    const newTickets = Array.from({ length: data.quantity }).map((_, index) => {
      const ticketNumber = String(tickets.length + index + 1).padStart(6, '0');
      return {
        id: `TKT-2025-${String(tickets.length + index + 1).padStart(3, '0')}`,
        number: ticketNumber,
        clientName: data.clientName,
        amount: data.amount,
        date: new Date().toISOString(),
        seller: user?.name || 'Unknown',
        status: 'active' as const,
        printed: false,
        reprints: 0,
      };
    });

    setTickets([...newTickets, ...tickets]);
    setPrintingTicket(newTickets[0]);
    setIsModalOpen(false);
  };

  // Handle ticket reprint
  const handleReprint = (ticket: typeof MOCK_TICKETS[0]) => {
    setTickets(
      tickets.map(t =>
        t.id === ticket.id
          ? {
              ...t,
              reprints: t.reprints + 1,
            }
          : t
      )
    );
    setPrintingTicket(ticket);
  };

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'winner':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'winner':
        return 'Ganador';
      case 'cancelled':
        return 'Anulado';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Tickets</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre la venta e impresión de tickets para la lotería
        </p>
      </div>
      
      {/* Filters and search */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Buscar tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {TICKET_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Ticket
        </button>
      </div>
      
      {/* Tickets table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('number')}
                >
                  <div className="flex items-center">
                    Número
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('clientName')}
                >
                  <div className="flex items-center">
                    Cliente
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('amount')}
                >
                  <div className="flex items-center">
                    Monto
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('date')}
                >
                  <div className="flex items-center">
                    Fecha
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vendedor
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-md bg-blue-100 flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-blue-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            #{ticket.number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${ticket.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(ticket.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.seller}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          ticket.status
                        )}`}
                      >
                        {getStatusText(ticket.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
  <button
    onClick={() => handleReprint(ticket)}
    className="text-blue-600 hover:text-blue-900 mr-3"
    title="Reimprimir"
  >
    <Printer className="h-5 w-5" />
  </button>
  {/* <button
    className="text-green-600 hover:text-green-900"
    title="Descargar"
  >
    <Download className="h-5 w-5" />
  </button> */}
</td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron tickets
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Ticket Modal */}
      {isModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsModalOpen(false)}
            ></div>
            
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Nuevo Ticket
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="clientName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre del Cliente
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="clientName"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.clientName ? 'border-red-300' : ''
                          }`}
                          {...register('clientName')}
                        />
                        {errors.clientName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.clientName.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Monto
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="amount"
                          step="0.01"
                          className={`pl-7 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.amount ? 'border-red-300' : ''
                          }`}
                          {...register('amount', { valueAsNumber: true })}
                        />
                        {errors.amount && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.amount.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cantidad de Tickets
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="quantity"
                          min="1"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.quantity ? 'border-red-300' : ''
                          }`}
                          {...register('quantity', { valueAsNumber: true })}
                        />
                        {errors.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.quantity.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Generar e Imprimir
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Print Preview */}
      {printingTicket && (
        <div style={{ display: 'none' }}>
          <div ref={printRef} className="p-4 max-w-xs mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">LOTERÍA ELECTRO</h2>
              <p className="text-sm">¡Juega y Gana!</p>
            </div>
            
            <div className="border-t border-b border-gray-200 py-2 mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Ticket #:</span>
                <span>{printingTicket.number}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Fecha:</span>
                <span>{format(new Date(printingTicket.date), 'dd/MM/yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Cliente:</span>
                <span>{printingTicket.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Monto:</span>
                <span>${printingTicket.amount.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-center text-sm mb-4">
              <p className="font-bold mb-2">¡IMPORTANTE!</p>
              <p>Asegure su ticket. Para reclamar su premio,</p>
              <p>llame al número: (555) 123-4567</p>
            </div>
            
            <div className="text-center text-xs">
              <p>Vendedor: {printingTicket.seller}</p>
              <p>ID: {printingTicket.id}</p>
              {printingTicket.reprints > 0 && (
                <p className="text-gray-500">Reimpresión #{printingTicket.reprints}</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {printingTicket && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Printer className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Imprimir Ticket
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Desea imprimir el ticket #{printingTicket.number}?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handlePrint}
                >
                  Imprimir
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setPrintingTicket(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;