import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

// Form validation schema
const saleSchema = z.object({
  clientId: z.string().min(1, 'El cliente es requerido'),
  products: z.array(
    z.object({
      productId: z.string().min(1, 'El producto es requerido'),
      quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
      price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
    })
  ).min(1, 'Debe agregar al menos un producto'),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  paymentStatus: z.string().min(1, 'El estado de pago es requerido'),
  installments: z.number().optional(),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleSchema>;

// Mock clients data
const MOCK_CLIENTS = [
  { id: '1', name: 'María González' },
  { id: '2', name: 'Juan Pérez' },
  { id: '3', name: 'Ana Rodríguez' },
  { id: '4', name: 'Carlos Martínez' },
  { id: '5', name: 'Laura Sánchez' },
];

// Mock products data
const MOCK_PRODUCTS = [
  { id: '1', name: 'Refrigerador Samsung', price: 1299.99 },
  { id: '2', name: 'Lavadora LG', price: 899.99 },
  { id: '3', name: 'Smart TV Sony', price: 1099.99 },
  { id: '4', name: 'Microondas Whirlpool', price: 249.99 },
  { id: '5', name: 'Aire Acondicionado Carrier', price: 799.99 },
];

// Mock sales data
const MOCK_SALES = [
  {
    id: 'VTA-2025-001',
    date: '2025-05-15',
    client: MOCK_CLIENTS[0],
    products: [
      { ...MOCK_PRODUCTS[0], quantity: 1 }
    ],
    total: 1299.99,
    paymentMethod: 'Tarjeta de Crédito',
    paymentStatus: 'Completado',
    installments: 0,
    notes: '',
    seller: 'Vendedor',
  },
  {
    id: 'VTA-2025-002',
    date: '2025-05-14',
    client: MOCK_CLIENTS[1],
    products: [
      { ...MOCK_PRODUCTS[1], quantity: 1 }
    ],
    total: 899.99,
    paymentMethod: 'Financiamiento',
    paymentStatus: 'Pendiente',
    installments: 6,
    notes: 'Pago inicial de $150',
    seller: 'Vendedor',
  },
  {
    id: 'VTA-2025-003',
    date: '2025-05-13',
    client: MOCK_CLIENTS[2],
    products: [
      { ...MOCK_PRODUCTS[2], quantity: 1 }
    ],
    total: 1099.99,
    paymentMethod: 'Efectivo',
    paymentStatus: 'Completado',
    installments: 0,
    notes: '',
    seller: 'Vendedor',
  },
  {
    id: 'VTA-2025-004',
    date: '2025-05-12',
    client: MOCK_CLIENTS[3],
    products: [
      { ...MOCK_PRODUCTS[3], quantity: 1 }
    ],
    total: 249.99,
    paymentMethod: 'Tarjeta de Débito',
    paymentStatus: 'Completado',
    installments: 0,
    notes: '',
    seller: 'Administrador',
  },
  {
    id: 'VTA-2025-005',
    date: '2025-05-11',
    client: MOCK_CLIENTS[4],
    products: [
      { ...MOCK_PRODUCTS[4], quantity: 1 }
    ],
    total: 799.99,
    paymentMethod: 'Financiamiento',
    paymentStatus: 'Pendiente',
    installments: 12,
    notes: 'Pago inicial de $100',
    seller: 'Vendedor',
  },
];

// Payment methods
const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Transferencia Bancaria',
  'Financiamiento',
];

// Payment statuses
const PAYMENT_STATUSES = [
  'Completado',
  'Pendiente',
  'Cancelado',
];

const Ventas: React.FC = () => {
  const [sales, setSales] = useState(MOCK_SALES);
  const [filteredSales, setFilteredSales] = useState(MOCK_SALES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<typeof MOCK_SALES[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_SALES[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  // Form state for dynamic product fields
  const [productFields, setProductFields] = useState([{ productId: '', quantity: 1 }]);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
    control,
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      products: [{ productId: '', quantity: 1, price: 0 }],
      paymentMethod: '',
      paymentStatus: '',
      installments: 0,
      notes: '',
    },
  });
  
  // Watch for payment method changes
  const watchPaymentMethod = watch('paymentMethod');
  
  // Filter sales based on search term and status
  React.useEffect(() => {
    let result = sales;
    
    if (searchTerm) {
      result = result.filter(
        sale =>
          sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.products.some(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }
    
    if (selectedStatus !== 'Todos') {
      result = result.filter(sale => sale.paymentStatus === selectedStatus);
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
    
    setFilteredSales(result);
  }, [sales, searchTerm, selectedStatus, sortConfig]);
  
  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_SALES[0]) => {
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
  
  // Open modal for adding a new sale
  const openAddModal = () => {
    setProductFields([{ productId: '', quantity: 1 }]);
    reset({
      clientId: '',
      products: [{ productId: '', quantity: 1, price: 0 }],
      paymentMethod: '',
      paymentStatus: '',
      installments: 0,
      notes: '',
    });
    setIsModalOpen(true);
  };
  
  // Open modal for viewing a sale
  const openViewModal = (sale: typeof MOCK_SALES[0]) => {
    setViewingSale(sale);
    setIsViewModalOpen(true);
  };
  
  // Add product field
  const addProductField = () => {
    setProductFields([...productFields, { productId: '', quantity: 1 }]);
    const currentProducts = watch('products') || [];
    setValue('products', [...currentProducts, { productId: '', quantity: 1, price: 0 }]);
  };
  
  // Remove product field
  const removeProductField = (index: number) => {
    const updatedFields = [...productFields];
    updatedFields.splice(index, 1);
    setProductFields(updatedFields);
    
    const currentProducts = watch('products') || [];
    const updatedProducts = [...currentProducts];
    updatedProducts.splice(index, 1);
    setValue('products', updatedProducts);
  };
  
  // Handle product selection
  const handleProductChange = (index: number, productId: string) => {
    const product = MOCK_PRODUCTS.find(p => p.id === productId);
    if (product) {
      const currentProducts = watch('products') || [];
      const updatedProducts = [...currentProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        productId,
        price: product.price,
      };
      setValue('products', updatedProducts);
    }
  };
  
  // Calculate total
  const calculateTotal = () => {
    const products = watch('products') || [];
    return products.reduce((total, product) => {
      return total + (product.price || 0) * (product.quantity || 0);
    }, 0);
  };
  
  // Handle form submission
  const onSubmit = (data: SaleFormData) => {
    const client = MOCK_CLIENTS.find(c => c.id === data.clientId);
    if (!client) return;
    
    const saleProducts = data.products.map(p => {
      const product = MOCK_PRODUCTS.find(prod => prod.id === p.productId);
      return {
        id: product?.id || '',
        name: product?.name || '',
        price: product?.price || 0,
        // ...product,
        // @ts-ignore
        // product: product,
        quantity: p.quantity,
      };
    });
    
    const newSale = {
      id: `VTA-2025-${String(sales.length + 1).padStart(3, '0')}`,
      date: format(new Date(), 'yyyy-MM-dd'),
      client,
      products: saleProducts,
      total: calculateTotal(),
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      installments: data.installments || 0,
      notes: data.notes || '',
      seller: 'Vendedor',
    };
    
    setSales([newSale, ...sales]);
    setIsModalOpen(false);
  };
  
  // Handle sale deletion
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta venta?')) {
      setSales(sales.filter(s => s.id !== id));
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Ventas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Registre y administre las ventas de la tienda
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
            placeholder="Buscar ventas..."
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
            <option value="Todos">Todos los estados</option>
            {PAYMENT_STATUSES.map((status) => (
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
          Nueva Venta
        </button>
      </div>
      
      {/* Sales table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('id')}
                >
                  <div className="flex items-center">
                    ID
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
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('total')}
                >
                  <div className="flex items-center">
                    Total
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Método de Pago
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
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sale.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.paymentMethod}
                      {sale.installments > 0 && ` (${sale.installments} cuotas)`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          sale.paymentStatus === 'Completado'
                            ? 'bg-green-100 text-green-800'
                            : sale.paymentStatus === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openViewModal(sale)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Descargar factura"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron ventas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Sale Modal */}
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
                      Nueva Venta
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Client selection */}
                    <div>
                      <label
                        htmlFor="clientId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Cliente
                      </label>
                      <div className="mt-1">
                        <select
                          id="clientId"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.clientId ? 'border-red-300' : ''
                          }`}
                          {...register('clientId')}
                        >
                          <option value="">Seleccionar cliente</option>
                          {MOCK_CLIENTS.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                        {errors.clientId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.clientId.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Products */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Productos
                      </label>
                      
                      {productFields.map((field, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <div className="flex-1">
                            <select
                              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                errors.products?.[index]?.productId ? 'border-red-300' : ''
                              }`}
                              {...register(`products.${index}.productId`)}
                              onChange={(e) => handleProductChange(index, e.target.value)}
                            >
                              <option value="">Seleccionar producto</option>
                              {MOCK_PRODUCTS.map((product) => (
                                <option key={product.id} value={product.id}>
                                  {product.name} - ${product.price.toFixed(2)}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              min="1"
                              className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                                errors.products?.[index]?.quantity ? 'border-red-300' : ''
                              }`}
                              placeholder="Cant."
                              {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                            />
                          </div>
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeProductField(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      
                      {errors.products && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.products.message}
                        </p>
                      )}
                      
                      <button
                        type="button"
                        onClick={addProductField}
                        className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Producto
                      </button>
                      
                      <div className="mt-3 text-right">
                        <span className="text-sm font-medium text-gray-700">
                          Total: ${calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Payment details */}
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="paymentMethod"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Método de Pago
                        </label>
                        <div className="mt-1">
                          <select
                            id="paymentMethod"
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              errors.paymentMethod ? 'border-red-300' : ''
                            }`}
                            {...register('paymentMethod')}
                          >
                            <option value="">Seleccionar método</option>
                            {PAYMENT_METHODS.map((method) => (
                              <option key={method} value={method}>
                                {method}
                              </option>
                            ))}
                          </select>
                          {errors.paymentMethod && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.paymentMethod.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="paymentStatus"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Estado de Pago
                        </label>
                        <div className="mt-1">
                          <select
                            id="paymentStatus"
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                              errors.paymentStatus ? 'border-red-300' : ''
                            }`}
                            {...register('paymentStatus')}
                          >
                            <option value="">Seleccionar estado</option>
                            {PAYMENT_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                          {errors.paymentStatus && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.paymentStatus.message}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {watchPaymentMethod === 'Financiamiento' && (
                        <div className="sm:col-span-3">
                          <label
                            htmlFor="installments"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Número de Cuotas
                          </label>
                          <div className="mt-1">
                            <select
                              id="installments"
                              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              {...register('installments', { valueAsNumber: true })}
                            >
                              <option value="3">3 cuotas</option>
                              <option value="6">6 cuotas</option>
                              <option value="12">12 cuotas</option>
                              <option value="18">18 cuotas</option>
                              <option value="24">24 cuotas</option>
                            </select>
                          </div>
                        </div>
                      )}
                      
                      <div className="sm:col-span-6">
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
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Registrar Venta
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
      
      {/* View Sale Modal */}
      {isViewModalOpen && viewingSale && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsViewModalOpen(false)}
            ></div>
            
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-500" />
                    Detalle de Venta
                  </h3>
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {viewingSale.id}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 py-3">
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Fecha</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {new Date(viewingSale.date).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewingSale.client.name}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Método de Pago</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {viewingSale.paymentMethod}
                      </dd>
                    </div>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Estado</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            viewingSale.paymentStatus === 'Completado'
                              ? 'bg-green-100 text-green-800'
                              : viewingSale.paymentStatus === 'Pendiente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {viewingSale.paymentStatus}
                        </span>
                      </dd>
                    </div>
                    
                    {viewingSale.installments > 0 && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Financiamiento</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {viewingSale.installments} cuotas
                        </dd>
                      </div>
                    )}
                    
                    {viewingSale.notes && (
                      <div className="sm:col-span-2">
                        <dt className="text-sm font-medium text-gray-500">Notas</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {viewingSale.notes}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <div className="border-t border-gray-200 py-3">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Productos</h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Producto
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Precio
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Cant.
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewingSale.products.map((product, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {product.quantity}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            ${(product.price * product.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-sm font-medium text-gray-900 text-right">
                          Total:
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                          ${viewingSale.total.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              
              
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;
