import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'

const FILTER_ARR = [
  {
    Key: "type",
    Title: "Type",
    options: ["Curly", "Straight", "Wavy"],
  },
  {
    Key: "length",
    Title: "Length",
    options: ["12 inch", "14 inch", "16 inch", "18 inch"],
  },
  {
    Key: "color",
    Title: "Color",
    options: [
      { label: "Black", value: "black", className: "bg-black" },
      { label: "Brown", value: "brown", className: "bg-yellow-800" },
      { label: "Blonde", value: "blonde", className: "bg-yellow-400" },
    ],
  },
  {
    Key: "texture",
    Title: "Texture",
    options: ["Silky", "Coarse", "Kinky"],
  },
];

const Collections = () => {
    
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState (true)
const [error, setError] = useState( null)

  const [selectedfilterItem, setSelectedfilterItem] = useState({});
  const { type = [], length = [], color = [], texture = [] } = selectedfilterItem;

  // Apply filtering
  const filteredProducts = products.filter((product) => {
    if (type.length > 0 && !type.includes(product.type)) return false;
    if (length.length > 0 && !length.includes(product.length)) return false;
    if (color.length > 0 && !color.includes(product.color)) return false;
    if (texture.length > 0 && !texture.includes(product.texture)) return false;
    return true;
  });

const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 12;

const indexOfLastItem = currentPage + itemsPerPage;
const indexOfFirstItem = indexOfLastItem -itemsPerPage;
const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem)



// Total pages
const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

useEffect(() => {
    fetch("http://localhost:5002/")
    .then((response)=>{
        if (!response.ok)
            throw new Error(`HTTP ${response.status}`)
        return response.json()
    })
    .then((data)=>{
        setProducts(data)
        setLoading(false)
    })
    
    .catch((err)=> {
    console.error("fetch error:", err)
    setError(err.message)
    setLoading(false)
    })
},[])


if (loading) {
    return <p>Loading…</p>;
  }
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }





  function HandleToggle(groupKey, value)  {
    setSelectedfilterItem(prevtype => {
        const group = prevtype[groupKey] || [];
        const  isSelected = group.includes(value)
        const nextGroup = isSelected
        ? group.filter(v => v !== value ) : [group, value]
        return{
        ... prevtype,
        [groupKey]: nextGroup
        }
        
    })

  }

  return (
    <div>
      <section className="bg-purple-100 py-4">
        <h1 className="font-bold text-3xl text-center font-['Playfair_Display'] text-black">PURPLE EXTENSION</h1>
        <p className="text-lg md:text-xl font-['Playfair_Display'] leading-relaxed text-center text-black">Shop our premium quality hair extension crafted for queens</p>
      </section>

      <div className="flex">
      <aside className="bg-white p-6 shadow-md w-64 rounded-2xl">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        {FILTER_ARR.map(section => (
          <div key={section.Key} className="mb-6">
            <h3 className="font-medium mb-2">{section.Title}</h3>
            {section.Key !== 'color' ? (
              section.options.map(option => (
                <label key={option} className="flex items-center mb-2 text-gray-700 hover:text-gray-900 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-indigo-600"
                    checked={(selectedfilterItem[section.Key] || []).includes(option)}
                    onChange={() => HandleToggle(section.Key, option)}
                  />
                  <span className="ml-2">{option}</span>
                </label>
              ))
            ) : (
              <div className="flex space-x-3">
                {section.options.map(({ label, value, className: bgClass }) => (
                  <button
                    key={value}
                    className={`w-6 h-6 rounded-full border-2 ${
                      (selectedfilterItem[section.Key] || []).includes(value) ? 'border-black' : 'border-gray-200'
                    } focus:outline-none ${bgClass}`}
                    onClick={() => HandleToggle(section.Key, value)}
                    aria-label={label}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      <main className="flex-1 py-16 bg-white">
      <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
      {filteredProducts.length > 0 ? (
      filteredProducts.map(product => (
        <div
          key={product.id}
          className=" w-full sm:w-[300px] flex flex-col items-center"
        >
         <Link key={product.id}
         to={`/singleproductpage/${product.id}`} 
         className="w-full sm:w-[300px] flex flex-col items-center no-underline">
          {/* 1) Image on top */}
          <div className="w-full h-84 bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={`http://127.0.0.1:5002/${product.image_url}`}
              alt={product.product_name}
              className="w-full h-full object-contain "
            />
          </div>

          {/* 2) Details below */}
          <div className="mt-4 text-center">
            <h3 className="text-purple-800 font-bold text-lg mb-2">
              {product.product_name}
            </h3>
           {/* <p className="text-gray-600 text-sm mb-4">
              {product.product_description}
            </p>*/}
            
            {/* 3) Price and button aligned at bottom */}
            <div className="mt-auto flex items-center justify-between">
              <span className="text-purple-700 font-semibold mx-auto">
                ₦{product.product_price.toFixed(2)}
              </span>
        
            </div>
          </div>
          </Link>
        </div>
      ))
    ) : (
      <p className="text-center text-gray-500">No products match your filters.</p>
    )}
  </div>
</main>

      </div>

       <div className="flex justify-center items-center mt-8 space-x-4">
      <button
        className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50 mb-4"
        onClick={() => setCurrentPage(prev => prev - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      <span className="text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50 mb-4"
        onClick={() => setCurrentPage(prev => prev + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
      </div>

    </div>
  );
};

export default Collections;
