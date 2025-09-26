// src/components/NewInStore.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import {Link} from "react-router-dom";

const NewInStore = () => {
  const [newStock, setNewStock] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    fetch("http://127.0.0.1:5002/new_stock")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch new stock");
        return res.json();
      })
      .then((data) => {
        setNewStock(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <p className="text-sm text-center mt-6 mb-4 text-purple-700">
        Explore our newest collections at Purple Extension — crafted for queens who embrace beauty with purpose. <br />
        Our premium hair extensions blend everyday wearability with standout style, empowering you to express confidence and elegance in every strand.
      </p>

      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {error && <p clas sName="text-center text-red-500">{error}</p>}
        
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
         
        {newStock.map((product) => (
           <Link key={product.id}
            to={`/singleproductpage/${product.id}`} 
            className="w-full sm:w-[300px] flex flex-col items-center no-underline">
          
           <ProductCard
            key={product.id}
            title={product.product_name}
            price={product.product_price}
            image={`http://127.0.0.1:5002/${product.image_url}`}
            colors={product.colors}
          />
            </Link>
        ))}
      </div>
    </div>
  );
};

export default NewInStore;
