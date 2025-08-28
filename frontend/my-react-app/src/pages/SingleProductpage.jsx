import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import CartDrawer from '../components/CartDrawer';

const SingleProductpage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [count, setCount] = useState(1);
  const [relatedProduct, setRelatedProduct] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [cartRefreshKey, setCartRefreshKey] = useState(0); // 👈 trigger reload in CartDrawer
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedLength, setSelectedLength] = useState('');


  function getSessionId() {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      return sessionId;
    } else {
      return ""
    }
  }

  function setSessionId(sessionId) {
    localStorage.setItem('session_id', sessionId);
  }

  useEffect(() => {
    fetch(`http://localhost:5002/products/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("fetch error", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch(`http://localhost:5002/related_products/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        setRelatedProduct(data);
        console.log("Related Product:", data);
      })
      .catch((err) => {
        console.error("failed to fetch related product", err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    setMessage('');
  }, [count, id]);

  const handleDecrement = () => count > 1 && setCount(count - 1);

  const handleIncrement = () => {
    if (count < product.stock) {
      setCount(count + 1);
    } else {
      setMessage(`Only ${product.stock} item(s) available`);
    }
  };

  const handleAddToCart = () => {
    if (!product?.id || count < 1) {
      setMessage('Invalid product or quantity');
      return;
    }
    if (count > product.stock) {
      setMessage(`Only ${product.stock} item(s) available in stock`);
      return;
    }

    fetch('http://localhost:5002/addto_cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        product_id: product.id,
        quantity: count,
        session_id: getSessionId() // Use session ID from localStorage
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            throw new Error(data.message || 'Failed to add to cart');
          });
        }
        return res.json();
      })
      .then(data => {
        console.log('Server response:', data);
        setMessage(data.message);
        setSessionId(data.session_id); // 👈 Update session ID in localStorage
        setCartRefreshKey(prev => prev + 1);  //  Refresh cart drawer
        setIsCartOpen(true);                 // Open cart drawer after success
      })
      .catch(err => {
        console.error('Error adding to cart:', err);
        setMessage(err.message || 'Failed to add to cart');
      });
  };

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  return (
    <div>
      {/* Product Detail Section */}
      <div className="h-[500px] flex space-x-8 p-8" key={product.id}>
        <div className="w-1/2">
          <img
            src={`http://127.0.0.1:5002/${product.image_url}`}
            alt={product.product_name}
            className='w-full h-full object-contain rounded-xl shadow'
          />
        </div>
        <div className="w-1/2 flex flex-col space-x-4">
          <h2 className="text-gray-600 font-semibold text-3xl mb-2">{product.product_name}</h2>
          <p className="mb-4 text-gray-700 font-semibold text-2xl">₦{product.product_price}</p>
          <p className="text-sm mb-2 text-gray-700">{product.product_description}</p>
          <p className="text-sm text-gray-600">Available stock: {product.stock}</p>
         <div className="mt-4">
          <span className="font-semibold text-gray-700">Choose Color:</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {Array.isArray(product.color) ? (
              product.color.map((c, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedColor(c)}
                  className={`px-3 py-1 rounded border ${
                    selectedColor === c
                      ? 'bg-purple-700 text-white'
                      : 'bg-white text-gray-700 border-purple-400'
                  }`}
                >
                  {c}
                </button>
              ))
            ) : (
              <p className="text-gray-500">{product.color}</p> // fallback if it's not an array
            )}
          </div>
      </div>


          <div className="flex flex-col items-start mt-6">
            <span className="mb-1 font-semibold">Length</span>
            <p className="inline-block border border-purple-400 px-2 rounded">{product.length}</p>
          </div>

          {/* Quantity Selector and Add to Cart */}
          <div className="flex items-center space-x-2 mt-20">
            <div className="flex items-center space-x-2 border border-purple-400 px-4 py-1 rounded">
              <button
                onClick={handleDecrement}
                className="px-3 py-1 rounded disabled:opacity-50"
                disabled={count <= 1}
              >
                -
              </button>
              <span className="w-8 text-center">{count}</span>
              <button
                onClick={handleIncrement}
                className="px-3 py-1 rounded disabled:opacity-50"
                disabled={count >= product.stock}
              >
                +
              </button>
            </div>

            <button
              className='bg-purple-700 text-white px-6 py-2 rounded'
              onClick={handleAddToCart}
            >
              Add To Cart
            </button>
          </div>

          {/* Show error/success message */}
          {message && (
            <p className="mt-4 text-red-600 font-semibold">{message}</p>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      <h3 className="text-center font-semibold mt-16 text-2xl">YOU MAY ALSO LIKE THIS</h3>
      <div className="flex flex-wrap justify-center px-4 py-6 gap-12 mx-auto max-w-6xl">
        {relatedProduct.slice(0, 3).map(product => (
          <Link
            key={product.id}
            to={`/singleproductpage/${product.id}`}
            className="w-full sm:w-[300px] flex flex-col items-center no-underline"
          >
            <div className="w-full h-74 p-4 bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={`http://127.0.0.1:5002${product.image_url}`}
                alt={product.product_name}
                className="w-full h-full object-contain"
              />
            </div>
            <h4 className="text-lg font-semibold mt-2 text-gray-800">
              {product.product_name}
            </h4>
            <p className="text-purple-600 font-bold">₦{product.product_price}</p>
          </Link>
        ))}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        refreshTrigger={cartRefreshKey} // ✅ Trigger fetch when cart updates
      />
    </div>
  );
};

export default SingleProductpage;
