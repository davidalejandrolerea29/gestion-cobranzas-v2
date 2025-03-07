import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  User
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const clientSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  documentType: z.string().min(1, 'El tipo de documento es requerido'),
  documentNumber: z.string().min(5, 'El número de documento debe tener al menos 5 caracteres'),
  email: z.string().email('Correo electrónico inválido').optional().or(z.literal('')),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  city: z.string().min(1, 'La ciudad es requerida'),
});

type ClientFormData = z.infer<typeof clientSchema>;

// Mock clients data
const MOCK_CLIENTS = [
  {
    id: '1',
    name: 'María González',
    documentType: 'DNI',
    documentNumber: '12345678',
    email: 'maria@example.com',
    phone: '555-123-4567',
    address: 'Av. Principal 123',
    city: 'Buenos Aires',
  },
  {
    id: '2',
    name: 'Juan Pérez',
    documentType: 'DNI',
    documentNumber: '87654321',
    email: 'juan@example.com',
    phone: '555-987-6543',
    address: 'Calle Secundaria 456',
    city: 'Córdoba',
  },
  {
    id: '3',
    name: 'Ana Rodríguez',
    documentType: 'Pasaporte',
    documentNumber: 'AB123456',
    email: 'ana@example.com',
    phone: '555-456-7890',
    address: 'Plaza Central 789',
    city: 'Rosario',
  },
  {
    id: '4',
    name: 'Carlos Martínez',
    documentType: 'DNI',
    documentNumber: '45678901',
    email: 'carlos@example.com',
    phone: '555-789-0123',
    address: 'Av. Libertador 234',
    city: 'Mendoza',
  },
  {
    id: '5',
    name: 'Laura Sánchez',
    documentType: 'DNI',
    documentNumber: '56789012',
    email: 'laura@example.com',
    phone: '555-234-5678',
    address: 'Calle Florida 567',
    city: 'Buenos Aires',
  },
];

// Document types
const DOCUMENT_TYPES = [
  'DNI',
  'Pasaporte',
  'CUIT',
  'CUIL',
  'Cédula de Identidad',
];

// Cities for filter
const CITIES = [
  'Todas',
  'Buenos Aires',
  'Córdoba',
  'Rosario',
  'Mendoza',
  'San Miguel de Tucumán',
  'La Plata',
  'Mar del Plata',
  'Salta',
  'Santa Fe',
];

const Clientes: React.FC = () => {
  const [clients, setClients] = useState(MOCK_CLIENTS);
  const [filteredClients, setFilteredClients] = useState(MOCK_CLIENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<typeof MOCK_CLIENTS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_CLIENTS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });
  
  // Filter clients based on search term and city
  React.useEffect(() => {
    let result = clients;
    
    if (searchTerm) {
      result = result.filter(
        client =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCity !== 'Todas') {
      result = result.filter(client => client.city === selectedCity);
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
    
    setFilteredClients(result);
  }, [clients, searchTerm, selectedCity, sortConfig]);
  
  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_CLIENTS[0]) => {
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
  
  // Open modal for adding a new client
  const openAddModal = () => {
    setEditingClient(null);
    reset({
      name: '',
      documentType: 'DNI',
      documentNumber: '',
      email: '',
      phone: '',
      address: '',
      city: '',
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing a client
  const openEditModal = (client: typeof MOCK_CLIENTS[0]) => {
    setEditingClient(client);
    setValue('name', client.name);
    setValue('documentType', client.documentType);
    setValue('documentNumber', client.documentNumber);
    setValue('email', client.email);
    setValue('phone', client.phone);
    setValue('address', client.address);
    setValue('city', client.city);
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      // Update existing client
      setClients(
        clients.map(c =>
          c.id === editingClient.id
            ? {
                ...c,
                ...data,
              }
            : c
        )
      );
    } else {
      // Add new client
      const newClient = {
        id: `${clients.length + 1}`,
        ...data,
      };
      setClients([...clients, newClient]);
    }
    
    setIsModalOpen(false);
  };
  
  // Handle client deletion
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Clientes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre la información de los clientes de la tienda
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
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
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
          Nuevo Cliente
        </button>
      </div>
      
      {/* Clients table */}
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
                  Documento
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('city')}
                >
                  <div className="flex items-center">
                    Ciudad
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contacto
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
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                            <User className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {client.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.documentType}: {client.documentNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.city}</div>
                      <div className="text-sm text-gray-500">
                        {client.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.phone}</div>
                      <div className="text-sm text-gray-500">{client.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron clientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Client Modal */}
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
                      {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre Completo
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
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="documentType"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tipo de Documento
                      </label>
                      <div className="mt-1">
                        <select
                          id="documentType"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.documentType ? 'border-red-300' : ''
                          }`}
                          {...register('documentType')}
                        >
                          {DOCUMENT_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors.documentType && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.documentType.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="documentNumber"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Número de Documento
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="documentNumber"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.documentNumber ? 'border-red-300' : ''
                          }`}
                          {...register('documentNumber')}
                        />
                        {errors.documentNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.documentNumber.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Correo Electrónico
                      </label>
                      <div className="mt-1">
                        <input
                          type="email"
                          id="email"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.email ? 'border-red-300' : ''
                          }`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Teléfono
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="phone"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.phone ? 'border-red-300' : ''
                          }`}
                          {...register('phone')}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Dirección
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="address"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.address ? 'border-red-300' : ''
                          }`}
                          {...register('address')}
                        />
                        {errors.address && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.address.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Ciudad
                      </label>
                      <div className="mt-1">
                        <select
                          id="city"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.city ? 'border-red-300' : ''
                          }`}
                          {...register('city')}
                        >
                          <option value="">Seleccionar ciudad</option>
                          {CITIES.filter(c => c !== 'Todas').map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.city.message}
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
                    {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
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
    </div>
  );
};

export default Clientes;