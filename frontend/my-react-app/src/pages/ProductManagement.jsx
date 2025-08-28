import React, { useEffect, useState } from 'react';
import {Link, } from 'react-router-dom'
import { toast } from 'react-toastify';




const ProductManagement = () => {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
 


  const HandleToggle = (productId) => {
  setProducts(prevProducts => 
    prevProducts.map(product => 
      product.id === productId
        ? { 
            ...product, 
            status: product.status === 'active' ? 'inactive' : 'active' 
          }
        : product
    )
  );
};

const handleDelete = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this product?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`http://localhost:5002/delete_product/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      toast.success("Product deleted successfully.");
      setProducts(products.filter((product) => product.id !== id));
    } else {
      toast.error("Failed to delete product.");
    }
  } catch (error) {
    console.error("Delete error:", error);
    toast.warning("An error occurred while deleting.");
  }
};


  useEffect(()=> {
    fetch('http://localhost:5002/')
    .then((response)=>{
        if(!response.ok)
            throw new Error(`HTTP ${response.status}`)
        return response.json()
    })
    .then((data)=>{
        console.log("Fetched Data:",data)
        console.log("API response data:", data);
        setProducts(data)
        setLoading(false);

    })
     .catch((err)=> {
    console.error("fetch error:", err)
    setError(err.message)
    setLoading(false)
    })
  },[])
   

  // Filtered product logic
  console.log('Products:', products);
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product?.product_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      filterCategory === 'All' || product?.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>

        <Link to='/addnewproduct'>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
          Add New Product
        </button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          className="border p-2 rounded-2xl w-full sm:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-2 rounded"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="ponytail">Ponytail</option>
          <option value="french curls extension">French curls extension</option>
           <option value="braided Wig">Braided Wig </option>
        </select>
      </div>

      {/* Product Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-white">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-700">
              <th className="p-4">Image</th>
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Color</th>
               <th className="p-4">Stock</th>
              <th className="p-4">Length</th>
              <th className="p-4">Visibility</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t">
                <td className="p-4">
                  <img
                    src={`http://127.0.0.1:5002/${product.image_url}`}
                    alt={product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                </td>
                <td className="p-4 font-medium">{product.product_name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">₦{product.product_price.toFixed(2)}</td>
                <td className="p-4">
                  {/* Fix for colors array display */}
                  {Array.isArray(product.colors) ? product.colors.join(", ") : product.colors}
                </td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4"> {product.lengths && product.lengths.length > 0 ? product.lengths.join(", ") : "—"}</td>
                <td className="p-4">
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" 
                    checked={product.status === 'active'} 
                    onChange={() => HandleToggle(product.id)}/>
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-purple-600" />
                  </label>
                </td>
                <td className="p-4 text-green-600">{product.status}</td>
                <td className="p-4 flex gap-2">
                 <Link to={`/editproduct/${product.id}`}><button className="text-purple-600 hover:underline">✏️</button> </Link> 
                  <button 
                   onClick={() => handleDelete(product.id)}
                  className="text-purple-600 hover:underline">🗑️</button>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
