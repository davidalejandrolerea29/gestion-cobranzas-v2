import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown,
  Trophy,
  Gift,
  Ticket
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// Form validation schema
const drawSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  prize: z.string().min(3, 'El premio debe tener al menos 3 caracteres'),
  drawDate: z.string().min(1, 'La fecha del sorteo es requerida'),
  winningNumber: z.string().optional(),
  winnerName: z.string().optional(),
  notes: z.string().optional(),
});

type DrawFormData = z.infer<typeof drawSchema>;

// Mock draws data
const MOCK_DRAWS = [
  {
    id: 'SRT-2025-001',
    name: 'Sort eo Mayo 2025',
    prize: 'Televisor LED 55"',
    drawDate: '2025-05-31T18:00:00',
    status: 'pending',
    winningNumber: null,
    winnerName: null,
    notes: 'Sorteo mensual',
  },
  {
    id: 'SRT-2025-002',
    name: 'Sorteo Especial',
    prize: 'Refrigerador Samsung',
    drawDate: '2025-05-15T15:00:00',
    status: 'completed',
    winningNumber: '000003',
    winnerName: 'Ana Rodríguez',
    notes: 'Sorteo especial por aniversario',
  },
];

// Draw statuses for filter
const DRAW_STATUSES = [
  'Todos',
  'Pendientes',
  'Completados',
];

const Sorteos: React.FC = () => {
  const [draws, setDraws] = useState(MOCK_DRAWS);
  const [filteredDraws, setFilteredDraws] = useState(MOCK_DRAWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<typeof MOCK_DRAWS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_DRAWS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DrawFormData>({
    resolver: zodResolver(drawSchema),
  });

  // Filter draws based on search term and status
  React.useEffect(() => {
    let result = draws;
    
    if (searchTerm) {
      result = result.filter(
        draw =>
          draw.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          draw.prize.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (draw.winnerName && draw.winnerName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedStatus !== 'Todos') {
      const statusMap: Record<string, string> = {
        'Pendientes': 'pending',
        'Completados': 'completed',
      };
      result = result.filter(draw => draw.status === statusMap[selectedStatus]);
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
    
    setFilteredDraws(result);
  }, [draws, searchTerm, selectedStatus, sortConfig]);

  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_DRAWS[0]) => {
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

  // Open modal for adding a new draw
  const openAddModal = () => {
    reset({
      name: '',
      prize: '',
      drawDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for performing the draw
  const openDrawModal = (draw: typeof MOCK_DRAWS[0]) => {
    setSelectedDraw(draw);
    setIsDrawModalOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: DrawFormData) => {
    const newDraw = {
      id: `SRT-2025-${String(draws.length + 1).padStart(3, '0')}`,
      ...data,
      status: 'pending' as const,
      winningNumber: null,
      winnerName: null,
    };
    
    setDraws([newDraw, ...draws]);
    setIsModalOpen(false);
  };

  // Perform the draw
  const performDraw = () => {
    if (!selectedDraw) return;

    // Simulate random winner selection
    const winningNumber = String(Math.floor(Math.random() * 1000)).padStart(6, '0');
    const winnerName = 'Ana Rodríguez'; // In real app, this would be looked up from tickets

    setDraws(
      draws.map(d =>
        d.id === selectedDraw.id
          ? {
              ...d,
              status: 'completed' as const,
              winningNumber,
              winnerName,
            }
          : d
      )
    );
    setIsDrawModalOpen(false);
  };

  // Get status class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Sorteos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre los sorteos y seleccione los ganadores
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
            placeholder="Buscar sorteos..."
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
            {DRAW_STATUSES.map((status) => (
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
          Nuevo Sorteo
        </button>
      </div>
      
      {/* Draws table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('name')}
                >
                  <div className="flex items-center">
                    Nombre
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Premio
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('drawDate')}
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
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Ganador
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
              {filteredDraws.length > 0 ? (
                filteredDraws.map((draw) => (
                  <tr key={draw.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-md bg-purple-100 flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-purple-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {draw.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {draw.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Gift className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{draw.prize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(draw.drawDate).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          draw.status
                        )}`}
                      >
                        {getStatusText(draw.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {draw.winningNumber ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            Ticket #{draw.winningNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {draw.winnerName}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Pendiente de sorteo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {draw.status === 'pending' && (
                        <button
                          onClick={() => openDrawModal(draw)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Realizar sorteo"
                        >
                          <Trophy className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron sorteos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Draw Modal */}
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
                      Nuevo Sorteo
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre del Sorteo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="name"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.name ? 'border-red-300' : ''
                          }`}
                          {...register('name')}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.name.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="prize"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Premio
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="prize"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.prize ? 'border-red-300' : ''
                          }`}
                          {...register('prize')}
                        />
                        {errors.prize && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.prize.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="drawDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha y Hora del Sorteo
                      </label>
                      <div className="mt-1">
                        <input
                          type="datetime-local"
                          id="drawDate"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.drawDate ? 'border-red-300' : ''
                          }`}
                          {...register('drawDate')}
                        />
                        {errors.drawDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.drawDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Notas
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="notes"
                          rows={3}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          {...register('notes')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Crear Sorteo
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
      
      {/* Draw Modal */}
      {isDrawModalOpen && selectedDraw && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsDrawModalOpen(false)}
            ></div>
            
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Realizar Sorteo
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        ¿Está seguro de que desea realizar el sorteo "{selectedDraw.name}"?
                        Esta acción no se puede deshacer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={performDraw}
                >
                  Realizar Sorteo
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setIsDrawModalOpen(false)}
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

export default Sorteos;