import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  UserCog,
  ShieldCheck,
  ShoppingCart,
  CreditCard
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserRole } from '../contexts/AuthContext';

// Form validation schema
const userSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'vendedor', 'cobrador']),
  active: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;

// Mock users data
const MOCK_USERS = [
  {
    id: '1',
    name: 'Administrador',
    email: 'admin@electrodomesticos.com',
    role: 'admin' as UserRole,
    active: true,
    lastLogin: '2025-05-15T10:30:00',
  },
  {
    id: '2',
    name: 'Vendedor',
    email: 'vendedor@electrodomesticos.com',
    role: 'vendedor' as UserRole,
    active: true,
    lastLogin: '2025-05-15T09:15:00',
  },
  {
    id: '3',
    name: 'Cobrador',
    email: 'cobrador@electrodomesticos.com',
    role: 'cobrador' as UserRole,
    active: true,
    lastLogin: '2025-05-14T16:45:00',
  },
  {
    id: '4',
    name: 'Juan Vendedor',
    email: 'juan@electrodomesticos.com',
    role: 'vendedor' as UserRole,
    active: true,
    lastLogin: '2025-05-13T11:20:00',
  },
  {
    id: '5',
    name: 'Ana Cobradora',
    email: 'ana@electrodomesticos.com',
    role: 'cobrador' as UserRole,
    active: false,
    lastLogin: '2025-04-28T14:10:00',
  },
];

// User roles for filter
const USER_ROLES = [
  'Todos',
  'admin',
  'vendedor',
  'cobrador',
];

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof MOCK_USERS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_USERS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'vendedor',
      active: true,
    },
  });
  
  // Filter users based on search term and role
  React.useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      result = result.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedRole !== 'Todos') {
      result = result.filter(user => user.role === selectedRole);
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
    
    setFilteredUsers(result);
  }, [users, searchTerm, selectedRole, sortConfig]);
  
  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_USERS[0]) => {
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
  
  // Open modal for adding a new user
  const openAddModal = () => {
    setEditingUser(null);
    reset({
      name: '',
      email: '',
      password: '',
      role: 'vendedor',
      active: true,
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing a user
  const openEditModal = (user: typeof MOCK_USERS[0]) => {
    setEditingUser(user);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('password', ''); // Don't show the password
    setValue('role', user.role);
    setValue('active', user.active);
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (data: UserFormData) => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                ...data,
                // Keep the lastLogin from the existing user
                lastLogin: u.lastLogin,
              }
            : u
        )
      );
    } else {
      // Add new user
      const newUser = {
        id: `${users.length + 1}`,
        ...data,
        lastLogin: '',
      };
      setUsers([...users, newUser]);
    }
    
    setIsModalOpen(false);
  };
  
  // Handle user deletion
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };
  
  // Toggle user active status
  const toggleUserStatus = (id: string) => {
    setUsers(
      users.map(u =>
        u.id === id
          ? {
              ...u,
              active: !u.active,
            }
          : u
      )
    );
  };
  
  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="h-5 w-5 text-purple-500" />;
      case 'vendedor':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />;
      case 'cobrador':
        return <CreditCard className="h-5 w-5 text-green-500" />;
      default:
        return <UserCog className="h-5 w-5 text-gray-500" />;
    }
  };
  
  // Format role name for display
  const formatRoleName = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'vendedor':
        return 'Vendedor';
      case 'cobrador':
        return 'Cobrador';
      default:
        return role;
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre los usuarios del sistema y sus permisos
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
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {USER_ROLES.map((role) => (
              <option key={role} value={role}>
                {role === 'Todos' ? role : formatRoleName(role as UserRole)}
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
          Nuevo Usuario
        </button>
      </div>
      
      {/* Users table */}
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
                    Usuario
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('email')}
                >
                  <div className="flex items-center">
                    Correo Electrónico
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('role')}
                >
                  <div className="flex items-center">
                    Rol
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('lastLogin')}
                >
                  <div className="flex items-center">
                    Último Acceso
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('active')}
                >
                  <div className="flex items-center">
                    Estado
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {formatRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString()
                        : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`${
                          user.active
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        } mr-4`}
                        title={user.active ? 'Desactivar' : 'Activar'}
                      >
                        {user.active ? (
                          <Trash2 className="h-5 w-5" />
                        ) : (
                          <ShieldCheck className="h-5 w-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron usuarios
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* User Modal */}
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
                      {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
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
                    
                    <div className="sm:col-span-6">
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
                    
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {editingUser ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                      </label>
                      <div className="mt-1">
                        <input
                          type="password"
                          id="password"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.password ? 'border-red-300' : ''
                          }`}
                          {...register('password')}
                        />
                        {errors.password && !editingUser && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.password.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Rol
                      </label>
                      <div className="mt-1">
                        <select
                          id="role"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.role ? 'border-red-300' : ''
                          }`}
                          {...register('role')}
                        >
                          <option value="admin">Administrador</option>
                          <option value="vendedor">Vendedor</option>
                          <option value="cobrador">Cobrador</option>
                        </select>
                        {errors.role && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.role.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="active"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Estado
                      </label>
                      <div className="mt-1">
                        <select
                          id="active"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          {...register('active')}
                        >
                          <option value="true">Activo</option>
                          <option value="false">Inactivo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
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

export default Usuarios;