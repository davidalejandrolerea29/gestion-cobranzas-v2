import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  Package
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  brand: z.string().min(2, 'La marca debe tener al menos 2 caracteres'),
  category: z.string().min(2, 'La categoría es requerida'),
  price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  stock: z.number().int().min(0, 'El stock no puede ser negativo'),
  model: z.string().min(2, 'El modelo debe tener al menos 2 caracteres'),
  sku: z.string().min(3, 'El SKU debe tener al menos 3 caracteres'),
});

type ProductFormData = z.infer<typeof productSchema>;

// Mock product data
const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Refrigerador Samsung',
    description: 'Refrigerador de 500L con dispensador de agua y hielo',
    brand: 'Samsung',
    category: 'Refrigeración',
    price: 1299.99,
    stock: 15,
    model: 'RF28R7351SR',
    sku: 'REF-SAM-001',
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '2',
    name: 'Lavadora LG',
    description: 'Lavadora de carga frontal de 15kg con vapor',
    brand: 'LG',
    category: 'Lavado',
    price: 899.99,
    stock: 8,
    model: 'WM3900HWA',
    sku: 'LAV-LG-001',
    image: 'https://images.unsplash.com/photo-1626806787461-102c1a7f1c62?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '3',
    name: 'Smart TV Sony',
    description: 'Smart TV 4K de 55 pulgadas con Android TV',
    brand: 'Sony',
    category: 'Televisores',
    price: 1099.99,
    stock: 12,
    model: 'XBR-55X900H',
    sku: 'TV-SON-001',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '4',
    name: 'Microondas Whirlpool',
    description: 'Microondas de 1.1 pies cúbicos con grill',
    brand: 'Whirlpool',
    category: 'Cocina',
    price: 249.99,
    stock: 20,
    model: 'WMH31017HS',
    sku: 'MIC-WHI-001',
    image: 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  },
  {
    id: '5',
    name: 'Aire Acondicionado Carrier',
    description: 'Aire acondicionado split de 12000 BTU inverter',
    brand: 'Carrier',
    category: 'Climatización',
    price: 799.99,
    stock: 7,
    model: 'QHEK12',
    sku: 'AC-CAR-001',
    image: 'https://images.unsplash.com/photo-1581275288578-bfb9a6feeb41?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
  },
];

// Categories for filter
const CATEGORIES = [
  'Todas',
  'Refrigeración',
  'Lavado',
  'Televisores',
  'Cocina',
  'Climatización',
  'Audio',
  'Pequeños Electrodomésticos',
];

const Productos: React.FC = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof MOCK_PRODUCTS[0];
    direction: 'ascending' | 'descending';
  } | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0,
      stock: 0,
    },
  });
  
  // Filter products based on search term and category
  React.useEffect(() => {
    let result = products;
    
    if (searchTerm) {
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'Todas') {
      result = result.filter(product => product.category === selectedCategory);
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
    
    setFilteredProducts(result);
  }, [products, searchTerm, selectedCategory, sortConfig]);
  
  // Handle sorting
  const requestSort = (key: keyof typeof MOCK_PRODUCTS[0]) => {
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
  
  // Open modal for adding a new product
  const openAddModal = () => {
    setEditingProduct(null);
    reset({
      name: '',
      description: '',
      brand: '',
      category: '',
      price: 0,
      stock: 0,
      model: '',
      sku: '',
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing a product
  const openEditModal = (product: typeof MOCK_PRODUCTS[0]) => {
    setEditingProduct(product);
    setValue('name', product.name);
    setValue('description', product.description);
    setValue('brand', product.brand);
    setValue('category', product.category);
    setValue('price', product.price);
    setValue('stock', product.stock);
    setValue('model', product.model);
    setValue('sku', product.sku);
    setIsModalOpen(true);
  };
  
  // Handle form submission
  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map(p =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...data,
              }
            : p
        )
      );
    } else {
      // Add new product
      const newProduct = {
        id: `${products.length + 1}`,
        ...data,
        image: 'https://images.unsplash.com/photo-1581275288578-bfb9a6feeb41?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      };
      setProducts([...products, newProduct]);
    }
    
    setIsModalOpen(false);
  };
  
  // Handle product deletion
  const handleDelete = (id: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gestión de Productos</h1>
        <p className="mt-1 text-sm text-gray-500">
          Administre el inventario de productos de la tienda
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
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-400 mr-2" />
          <select
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
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
          Nuevo Producto
        </button>
      </div>
      
      {/* Products table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Producto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('category')}
                >
                  <div className="flex items-center">
                    Categoría
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('price')}
                >
                  <div className="flex items-center">
                    Precio
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('stock')}
                >
                  <div className="flex items-center">
                    Stock
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  SKU
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {product.image ? (
                            <img
                              className="h-10 w-10 rounded-md object-cover"
                              src={product.image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand} - {product.model}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
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
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Product Modal */}
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
                      {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nombre
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
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Descripción
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={3}
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.description ? 'border-red-300' : ''
                          }`}
                          {...register('description')}
                        />
                        {errors.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.description.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="brand"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Marca
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="brand"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.brand ? 'border-red-300' : ''
                          }`}
                          {...register('brand')}
                        />
                        {errors.brand && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.brand.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="model"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Modelo
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="model"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.model ? 'border-red-300' : ''
                          }`}
                          {...register('model')}
                        />
                        {errors.model && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.model.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="category"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Categoría
                      </label>
                      <div className="mt-1">
                        <select
                          id="category"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.category ? 'border-red-300' : ''
                          }`}
                          {...register('category')}
                        >
                          <option value="">Seleccionar categoría</option>
                          {CATEGORIES.filter(c => c !== 'Todas').map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                        {errors.category && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.category.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="sku"
                        className="block text-sm font-medium text-gray-700"
                      >
                        SKU
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="sku"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.sku ? 'border-red-300' : ''
                          }`}
                          {...register('sku')}
                        />
                        {errors.sku && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.sku.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="price"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Precio
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          id="price"
                          step="0.01"
                          className={`pl-7 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.price ? 'border-red-300' : ''
                          }`}
                          {...register('price', { valueAsNumber: true })}
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.price.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="stock"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Stock
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="stock"
                          className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                            errors.stock ? 'border-red-300' : ''
                          }`}
                          {...register('stock', { valueAsNumber: true })}
                        />
                        {errors.stock && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.stock.message}
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
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
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

export default Productos;