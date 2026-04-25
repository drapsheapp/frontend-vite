import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ProductCard = ({ product }) => {
  return (
    <Link to={`/product/${product.product_id}`} data-testid={`product-card-${product.product_id}`}>
      <div className="product-card group bg-white rounded-lg border border-silk-border overflow-hidden shadow-card hover:border-zari-gold cursor-pointer">
        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden bg-raw-silk relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            data-testid="product-image"
          />
          {product.stock_status !== 'in_stock' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white px-4 py-2 rounded-sm text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-royal-plum group-hover:text-zari-gold transition-colors" data-testid="product-name">
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1" data-testid="product-category">
                {product.category.replace('_', ' ')}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3" data-testid="product-description">
            {product.description}
          </p>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-semibold text-royal-plum" data-testid="product-price">
                ₹{product.base_price.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-500 ml-2">Starting</span>
            </div>
            <ArrowRight className="h-5 w-5 text-zari-gold group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;