import React from 'react'
import img5 from '../assets/curlyextension.png'
import productCard from './AboutUs';

    const products = [
        {
            id: 1,
            title: "piano twist",
            price: "₦16,000.00",
            image: img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },

        {
            id: 2,
            title: "piano twist",
            price: "₦16,000.00",
            image: img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },

        {
            id: 3,
            title: "piano twist",
            price: "₦16,000.00",
            image:  img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },

        {
            id: 4,
            title: "piano twist",
            price: "₦16,000.00",
            image:  img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },

        {
            id: 5,
            title: "piano twist",
            price: "₦16,000.00",
            image:  img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },

        {
            id: 6,
            title: "piano twist",
            price: "₦16,000.00",
            image: img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        },
        {
            id: 7,
            title: "piano twist",
            price: "₦16,000.00",
            image: img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        }, 
        {
            id: 8, 
            title: "piano twist",
            price: "₦16,000.00",
            image: img5,
            colors: ["bg-black", "bg-pink", "bg-purple" ]
        }, 
        
    ]

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
                {colors.map((color, index) => (
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
      
      const NewInStore = () => {

        return(
            <div> 
                <p className="text-small text-center mt-6 mb-4 text-purple-700"> Explore our newest collections at Purple Extension — crafted for queens who embrace beauty with purpose. <br />
                Our premium hair extensions blend everyday wearability with standout style, empowering you to express confidence and elegance in every strand.”</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6">
                {products.map((product) => (
                   <ProductCard
                   key={product.id}
                   title={product.title}
                   price={product.price}
                   image= {product.image}
                   colors= {product.colors}
                   />
                ))}
            </div>

            </div>

        )
}
export default NewInStore;