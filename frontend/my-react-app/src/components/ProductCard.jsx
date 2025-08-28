
import React from 'react';

function ProductCard({ title, price, image, colors }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-md hover:shadow-lg transition-all max-w-sm">
      <div className="relative">
        <span className="absolute top-2 left-2 bg-gray-100 text-xs text-purple-700 px-2 py-1 rounded">NEW</span>
        <img
          src={image}
          alt={title}
          className="rounded-xl object-cover w-full h-64"
        />
      </div>
      <div className="mt-4">
        <h3 className="text-gray-800 font-medium">{title}</h3>
        <p className="text-gray-600 text-sm">{price}</p>
        <div className="flex space-x-2 mt-2">
          {colors?.map((color, index) => (
            <span
              key={index}
              className={`w-5 h-5 rounded-full border border-gray-300 ${color}`}
            ></span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
