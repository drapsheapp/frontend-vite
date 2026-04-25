import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '@/api/api';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Filter, ChevronDown } from 'lucide-react';

const Products = () => {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');

  useEffect(() => {
  setSelectedCategory(category || 'all');
}, [category]);

  const categories = [
  { value: 'all', label: 'All Products' },
  { value: 'blouse', label: 'Blouse' },
  { value: 'salwar-kameez', label: 'Salwar Kameez' },
  { value: 'kurta-set', label: 'Kurta Set' },
  { value: 'pant', label: 'Pant' }
];

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const url = selectedCategory === 'all' 
        ? `/products/`
        : `/products/category/${selectedCategory}`;

      const response = await API.get(url);

      console.log("API RESPONSE:", response.data);

      // 🔥 SAFE FIX
      const data =
        response.data?.data ||
        response.data?.products ||
        response.data ||
        [];

      setProducts(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-raw-silk py-8" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-royal-plum mb-4" data-testid="products-title">
            Our Collections
          </h1>
          <p className="text-lg text-gray-600">
            Explore our premium range of custom-stitched ethnic wear
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm mb-8" data-testid="filters-section">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-2 rounded-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-royal-plum text-white'
                    : 'bg-raw-silk text-gray-700 hover:bg-gray-100'
                }`}
                data-testid={`filter-${cat.value}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20" data-testid="loading-state">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-plum mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" data-testid="no-products">
            <p className="text-xl text-gray-600">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6" data-testid="products-grid">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;