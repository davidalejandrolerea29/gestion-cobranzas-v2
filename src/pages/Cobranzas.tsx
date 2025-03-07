import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths, parseISO } from 'date-fns';

// Form validation schema
const paymentSchema = z.object({
  saleId: z.string().min(1, 'La venta es requerida'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  paymentMethod: z.string().min(1, 'El método de pago es requerido'),
  paymentDate: z.string().min(1, 'La fecha de pago es requerida'),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

// Mock sales data
const MOCK_SALES = [
  { 
    id: 'VTA-2025-001', 
    client: 'María González', 
    product: 'Refrigerador Samsung 500L',
    total: 1299.99,
    pendingAmount: 0,
    installments: 0,
    completed: true
  },
  { 
    id: 'VTA-2025-002', 
    client: 'Juan Pérez', 
    product: 'Lavadora LG 15kg',
    total: 899.99,
    pendingAmount: 749.99,
    installments: 6,
    completed: false
  },
  { 
    id: 'VTA-2025-003', 
    client: 'Ana Rodríguez', 
    product: 'Smart TV Sony 55"',
    total: 1099.99,
    pendingAmount: 0,
    installments: 0,
    completed: true
  },
  { 
    id: 'VTA-2025-004', 
    client: 'Carlos Martínez', 
    product: 'Microondas Whirlpool',
    total: 249.99,
    pendingAmount: 0,
    installments: 0,
    completed: true
  },
  { 
    id: 'VTA-2025-005', 
    client: 'Laura Sánchez', 
    product: 'Aire Acondicionado Carrier',
    total: 799.99,
    pendingAmount: 699.99,
    installments: 12,
    completed: false
  },
];

// Mock payments data
const MOCK_PAYMENTS = [
  {
    id: 'PAG-2025-001',
    saleId: 'VTA-2025-002',
    client: 'Juan Pérez',
    amount: 150.00,
    paymentMethod: 'Efectivo',
    paymentDate: '2025-05-14',
    installmentNumber: 1,
    totalInstallments: 6,
    notes: 'Pago inicial',
    status: 'completed',
  },
  {
    id: 'PAG-2025-002',
    saleId: 'VTA-2025-005',
    client: 'Laura Sánchez',
    amount: 100.00,
    paymentMethod: 'Efectivo',
    paymentDate: '2025-05-11',
    installmentNumber: 1,
    totalInstallments: 12,
    notes: 'Pago inicial',
    status: 'completed',
  },
  {
    id: 'PAG-2025-003',
    saleId: 'VTA-2025-002',
    client: 'Juan Pérez',
    amount: 125.00,
    paymentMethod: 'Transferencia Bancaria',
    paymentDate: '2025-06-14',
    installmentNumber: 2,
    totalInstallments: 6,
    notes: '',
    status: 'pending',
  },
  {
    id: 'PAG-2025-004',
    saleId: 'VTA-2025-005',
    client: 'Laura Sánchez',
    amount: 58.33,
    paymentMethod: 'Transferencia Bancaria',
    paymentDate: '2025-06-11',
    installmentNumber: 2,
    totalInstallments: 12,
    notes: '',
    status: 'pending',
  },
  {
    id: 'PAG-2025-005',
    saleId: 'VTA-2025-002',
    client: 'Juan Pérez',
    amount: 125.00,
    paymentMethod: 'Transferencia Bancaria',
    paymentDate: '2025-07-14',
    installmentNumber: 3,
    totalInstallments: 6,
    notes: '',
    status: 'pending',
  },
];

// Payment methods
const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Transferencia Bancaria',
];

// Payment statuses for filter
const PAYMENT_STATUSES = [
  'Todos',
  'Pendientes',
  'Completados',
  'Vencidos',
];

const Cobranzas: React.FC = () => {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [filteredPayments, setFilteredPayments] = useState(MOCK_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessPaymentModalOpen, setIsProcessPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState<typeof MOCK_PAYMENTS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_PAYMENTS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentMethod: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  });
  
  // Filter payments based on search term and status
  React.useEffect(() => {
    let result = payments;
    
    if (searchTerm) {
      result = result.filter(
        payment =>
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.saleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'Todos') {
      if (selectedStatus === 'Pendientes') {
        result = result.filter(payment => payment.status === 'pending');
      } else if (selectedStatus === 'Completados') {
        result = result.filter(payment => payment.status === 'completed');
      } else if (selectedStatus === 'Vencidos') {
        const today = new Date();
        result = result.filter(
          payment => 
            payment.status === 'pending' && 
            new Date(payment.paymentDate) < today
        );
      }
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
    
    setFilteredPayments(result);
  }, [payments, searchTerm, selectedStatus, sortConfig]);
  
  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_PAYMENTS[0]) => {
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
  
  // Open modal for adding a new payment
  const openAddModal = () => {
    reset({
      saleId: '',
      amount: 0,
      paymentMethod: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    });
    setIsModalOpen(true);
  };
  
  // Open modal for processing a payment
  const openProcessPaymentModal = (payment: typeof MOCK_PAYMENTS[0]) => {
    setProcessingPayment(payment);
    setValue('saleId', payment.saleId);
    setValue('amount', payment.amount);
    setValue('paymentMethod', '');
    setValue('paymentDate', format(new Date(), 'yyyy-MM-dd'));
    setValue('notes', '');
    setIsProcessPaymentModalOpen(true);
  };
  
  // Handle form submission for new payment
  const onSubmit = (data: PaymentFormData) => {
    const sale = MOCK_SALES.find(s => s.id === data.saleId);
    if (!sale) return;
    
    const newPayment = {
      id: `PAG-2025-${String(payments.length + 1).padStart(3, '0')}`,
      saleId: data.saleId,
      client: sale.client,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate,
      installmentNumber: 1, // This would be calculated based on previous payments
      totalInstallments: sale.installments,
      notes: data.notes || '',
      status: 'pending' as const,
    };
    
    setPayments([...payments, newPayment]);
    setIsModalOpen(false);
  };
  
  // Handle form submission for processing a payment
  const onProcessPayment = (data: PaymentFormData) => {
    if (!processingPayment) return;
    
    // Update the payment status
    setPayments(
      payments.map(p =>
        p.id === processingPayment.id
          ? {
              ...p,
              paymentMethod: data.paymentMethod,
              paymentDate: data.paymentDate,
              notes: data.notes || p.notes,
              status: 'completed' as const,
            }
          : p
      )
    );
    
    setIsProcessPaymentModalOpen(false);
  };
  
  // Generate installment plan for a sale
  const generateInstallmentPlan = (saleId: string) => {
    const sale = MOCK_SALES.find(s => s.id === saleId);
    if (!sale || sale.installments === 0) return [];
    
    const existingPayments = payments.filter(p => p.saleId === saleId);
    const initialPayment = existingPayments.find(p => p.installmentNumber === 1);
    
    if (!initialPayment) return [];
    
    const startDate = parseISO(initialPayment.paymentDate);
    const installmentAmount = (sale.total - initialPayment.amount) / (sale.installments - 1);
    
    const installments = [];
    
    // Add the initial payment
    installments.push({
      number: 1,
      date: format(startDate, 'yyyy-MM-dd'),
      amount: initialPayment.amount,
      status: initialPayment.status,
    });
    
    // Generate the rest of the installments
    for (let i = 1; i < sale.installments; i++) {
      const dueDate = addMonths(startDate, i);
      const existingPayment = existingPayments.find(p => p.installmentNumber === i + 1);
      
      installments.push({
        number: i + 1,
        date: format(dueDate, 'yyyy-MM-dd'),
        amount: installmentAmount,
        status: existingPayment ? existingPayment.status : 'pending',
      });
    }
    
    return installments;
  };
  
  // Get payment status class
  const getStatusClass = (status: string, date: string) => {
    if (status === 'completed') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      return new Date(date) < new Date()
        ? 'bg-red-100 text-red-800'
        : 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  // Get payment status icon
  const getStatusIcon = (status: string, date: string) => {
    if (status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'pending') {
      return new Date(date) < new Date() ? (
        <AlertCircle className="h-4 w-4 text-red-500" />
      ) : (
        <Clock className="h-4 w-4 text-yellow-500" />
      );
    }
    return null;
  };
  
  // Get payment status text
  const getStatusText = (status: string, date: string) => {
    if (status === 'completed') {
      return 'Completado';
    } else if (status === 'pending') {
      return new Date(date) < new Date() ? 'Vencido' : 'Pendiente';
    }
    return status;
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Cobranzas</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre los pagos y cuotas de las ventas financiadas
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
            placeholder="Buscar pagos..."
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
          Nuevo Pago
        </button>
      </div>
      
      {/* Payments table */}
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
                  onClick={() => requestSort('saleId')}
                >
                  <div className="flex items-center">
                    Venta
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
                  onClick={() => requestSort('paymentDate')}
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
                  Cuota
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
              {filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.saleId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.installmentNumber} de {payment.totalInstallments}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${getStatusClass(
                          payment.status,
                          payment.paymentDate
                        )}`}
                      >
                        {getStatusIcon(payment.status, payment.paymentDate)}
                        <span className="ml-1">
                          {getStatusText(payment.status, payment.paymentDate)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'pending' && (
                        <button
                          onClick={() => openProcessPaymentModal(payment)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Procesar pago"
                        >
                          <CreditCard className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron pagos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* New Payment Modal */}
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
                      Registrar Nuevo Pago
                    </h3>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Sale selection */}
                    <div>
                      <label
                        htmlFor="saleId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Venta
                      </label>
                      <div className="mt-1">
                        <select
                          id="saleId"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.saleId ? 'border-red-300' : ''
                          }`}
                          {...register('saleId')}
                        >
                          <option value="">Seleccionar venta</option>
                          {MOCK_SALES.filter(s => !s.completed).map((sale) => (
                            <option key={sale.id} value={sale.id}>
                              {sale.id} - {sale.client} - ${sale.pendingAmount.toFixed(2)} pendiente
                            </option>
                          ))}
                        </select>
                        {errors.saleId && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.saleId.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Payment amount */}
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
                    
                    {/* Payment method */}
                    <div>
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
                    
                    {/* Payment date */}
                    <div>
                      <label
                        htmlFor="paymentDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha de Pago
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="paymentDate"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.paymentDate ? 'border-red-300' : ''
                          }`}
                          {...register('paymentDate')}
                        />
                        {errors.paymentDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.paymentDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Notes */}
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
                    Registrar Pago
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
      
      {/* Process Payment Modal */}
      {isProcessPaymentModalOpen && processingPayment && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsProcessPaymentModalOpen(false)}
            ></div>
            
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit(onProcessPayment)}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Procesar Pago
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Cuota {processingPayment.installmentNumber} de {processingPayment.totalInstallments} - {processingPayment.client}
                    </p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Payment amount (read-only) */}
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
                          readOnly
                          className="pl-7 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          {...register('amount', { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                    
                    {/* Payment method */}
                    <div>
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
                    
                    {/* Payment date */}
                    <div>
                      <label
                        htmlFor="paymentDate"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Fecha de Pago
                      </label>
                      <div className="mt-1">
                        <input
                          type="date"
                          id="paymentDate"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.paymentDate ? 'border-red-300' : ''
                          }`}
                          {...register('paymentDate')}
                        />
                        {errors.paymentDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.paymentDate.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Notes */}
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
                    Confirmar Pago
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setIsProcessPaymentModalOpen(false)}
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

export default Cobranzas;