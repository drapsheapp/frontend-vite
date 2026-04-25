import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Scissors, Ruler, Truck } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import API from '@/api/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await API.get("/products");

      const data =
        response.data?.data ||
        response.data?.products ||
        response.data ||
        [];

      setFeaturedProducts(Array.isArray(data) ? data.slice(0, 8) : []);

    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const categories = [
    {
      name: 'Blouse',
      image: 'https://images.unsplash.com/photo-1738854378349-e4d03c761903',
      link: '/products/blouse'
    },
    {
      name: 'Salwar Kameez',
      image: 'https://images.unsplash.com/photo-1759840278381-bf7d5e332050',
      link: '/products/salwar-kameez'
    },
    {
      name: 'Kurta Set',
      image: 'https://images.unsplash.com/photo-1759840278361-f1adc75529a1',
      link: '/products/kurta-set'
    },
    {
      name: 'Pant',
      image: 'https://images.unsplash.com/photo-1768289222416-aa31e7d87892',
      link: '/products/pant'
    }
  ];

  const features = [
    {
      icon: <Ruler className="h-8 w-8 text-zari-gold" />,
      title: 'Perfect Measurements',
      description: 'Easy-to-follow measurement guides for the perfect fit every time'
    },
    {
      icon: <Scissors className="h-8 w-8 text-zari-gold" />,
      title: 'Expert Stitching',
      description: 'Skilled artisans with years of experience in ethnic wear'
    },
    {
      icon: <Truck className="h-8 w-8 text-zari-gold" />,
      title: 'Fast Delivery',
      description: 'Your custom stitched garments delivered within 7-10 days'
    },
    {
      icon: <Check className="h-8 w-8 text-zari-gold" />,
      title: 'Quality Assured',
      description: 'Premium fabrics and quality checks before every delivery'
    }
  ];

  return (
    <div className="min-h-screen" data-testid="home-page">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center fabric-texture" data-testid="hero-section">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1738854378349-e4d03c761903"
            alt="Hero"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-royal-plum mb-6 leading-tight" data-testid="hero-title">
              Custom Stitched
              <span className="block text-zari-gold mt-2">Ethnic Elegance</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-700 mb-8 leading-relaxed" data-testid="hero-description">
              Experience the luxury of perfectly tailored ethnic wear. From measurements to delivery, we handle everything with care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/products" data-testid="explore-collections-btn">
                <Button size="lg" className="bg-royal-plum hover:bg-royal-plum/90 text-white px-8 py-6 text-lg">
                  Explore Collections
                </Button>
              </Link>
              <Link to="/how-it-works" data-testid="how-it-works-btn">
                <Button size="lg" variant="outline" className="border-royal-plum text-royal-plum hover:bg-royal-plum hover:text-white px-8 py-6 text-lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Grid */}
      <section className="py-20 bg-white" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-display font-bold text-royal-plum mb-4" data-testid="categories-title">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto whitespace-nowrap">
              Choose from our curated collection of ethnic wear
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((category, index) => (
              <Link key={index} to={category.link} data-testid={`category-card-${index}`}>
                <div className="group relative h-52 sm:h-60 lg:h-80 rounded-lg overflow-hidden shadow-card hover:shadow-card-hover transition-shadow">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <h3 className="text-2xl font-display font-semibold text-white p-6 group-hover:text-zari-gold transition-colors" data-testid="category-name">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-raw-silk" data-testid="featured-products-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-display font-bold text-royal-plum mb-4">
                Featured Collection
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Handpicked designs from our premium collection
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id || product.product_id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/products" data-testid="view-all-btn">
                <Button size="lg" className="bg-royal-plum hover:bg-royal-plum/90 text-white">
                  View All Products
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-white" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-royal-plum mb-4">
              Why Choose Us
            </h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
              Experience the difference with our tailored service
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-raw-silk hover:shadow-card transition-shadow" data-testid={`feature-card-${index}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-royal-plum mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Brand Consistent Premium Cards */}
      <section className="py-16 bg-[#f8f5f2]">
        <div className="max-w-6xl mx-auto px-4">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-royal-plum">
                Next Day Delivery Available 🚚
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Fast & reliable delivery on selected orders
              </p>
            </div>

            {/* Card 2 (Highlight) */}
            <div className="bg-white border-2 border-royal-plum rounded-2xl p-6 text-center shadow-md scale-105">
              <p className="text-royal-plum text-lg">★★★★★</p>
              <h3 className="text-lg font-semibold text-gray-800 mt-2">
                Trusted by 1000+ customers
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Loved for quality stitching & perfect fit
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-800">
                We are a trusted brand
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Premium ethnic wear crafted with care
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-royal-plum text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-raw-silk/90 mb-8">
            Create your perfect ethnic wear today
          </p>
          <Link to="/products" data-testid="get-started-btn">
            <Button size="lg" className="bg-zari-gold text-royal-plum hover:bg-zari-gold/90 px-8 py-6 text-lg font-semibold">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;