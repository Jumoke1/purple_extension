import React, { useState , useEffect} from "react";
import heroImage from '../assets/pony1-removebgpng.png'
import { FaCrown, FaTruck, FaSmile, FaStar } from 'react-icons/fa';

import { Link } from "react-router-dom";


const testimonials = [
  {
    name: "Sarah Johnson",
    quote:
      "The quality is absolutely amazing! These extensions blend perfectly with my natural hair.",
    rating: 5,
  },
  {
    name: "Aisha B",
    quote: "I love how easy it is to install and style. Totally worth the price!",
    rating: 4,
  },
  {
    name: "Jessica Manuel",
    quote:
      "Great product, fast shipping, and beautiful packaging. Highly recommend!",
    rating: 5,
  },
];



const HomePage = () => {
  const [bestSeller, setBestSellers] = useState([]);
  const [Loading, setLoading] = useState(true)
  const [error, setError] = useState(null);

  useEffect(()=> {
fetch('http://127.0.0.1:5002/best_seller')
    .then((res)=> {
      if(!res.ok) throw new Error("failed to feth best sellers");
      return res.json();
    })
    .then((data)=>{
      setBestSellers(data)
      setLoading(false)
    })
     .catch((err)=>{
      setError(err.message)
      setLoading(false)
     })
  },[])


  return (
  <div>
  <section className="bg-purple-100 py-20">
    <div className="flex max-w-screen-xl mx-auto flex-col md:flex-row items-center justify-between px-6">
      {/*text*/}
      <div className="md:w-1/2  text-center md:text-left">
        <h1 className="font-bold md:text-5xl text-4xl text-gray-800 mb-4 leading-tight">
        Discover Your Perfect<br />Luxury Extensions
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Transform your look with premium quality hair extensions.
          </p>
         <Link to='/collections'> <button className="bg-purple-700 hover:bg-pink-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg transition">
           Shop Collection
          </button> </Link>
      </div>

      <div className="relative w-full md:w-[500px] h-[550px] mx-auto">
        {/* Image */}
      <img
        src={heroImage}
        alt="Luxury Hair Extension"
        className="w-full h-full object-cover rounded-lg"
      />

</div>

    </div>
  </section>
    
      <div className="flex flex-col md:flex-row justify-between items-center px-4 py-6 bg-white"> 
        <div className="md:w-1/3 flex flex-col items-center text-center">
        <FaCrown className="text-pink-500 text-4xl mb-3" />
        <h3 className="font-bold text-lg mb-1">Premium Quality</h3>
        <p className="text-gray-600"> 100% quality extension</p>
       </div>

        <div className="md:w-1/3 flex flex-col items-center text-center">
          <FaTruck className="text-pink-500 text-4xl mb-3" />
          <h3 className="font-bold text-lg mb-1">Free Delivery</h3>
           <p className="text-gray-600">For orders above one million naira</p>
        </div>

        <div className="md:w-1/3  flex flex-col items-center text-center">
          <FaSmile className="text-pink-500 text-4xl  mb-3" />
          <h3 className="font-bold text-lg mb-1">Satisfactory Guaranted</h3>
          <p  className="text-gray-600">100% quality extension</p>
        </div>
      </div>
{/* 
      <div className="flex flex-col md:flex-row justify-between item-center px-4 bg-purple-200">
        <h2 className="text-lg text-center mx-auto">Best Seller</h2>
      </div> */}

  <section className="py-16 bg-purple-100">
    <h2 className="text-center text-2xl font-semibold text-purple-800 mb-8">Best Sellers</h2>
    {Loading? (
      <p className="text-center text-gray-500">Loading best seller</p> 
    ): error?(
      <p className='text-cente text-red-500'>Error:{error}</p>
    ):(
      
    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto px-4">
      {bestSeller.map((product)=>(
        //card
    
        <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden w-full sm:w-[300px]">
           <Link key={product.id}
              to={`/singleproductpage/${product.id}`} 
              className="w-full sm:w-[300px] flex flex-col items-center no-underline">
          <img src={`http://127.0.0.1:5002/${product.image_url}`} alt={product.product_name} className="w-full h-64 object-contain" />
          <div className="p-4">
          <h3 className="text-purple-800 font-bold text-lg">{product.product_name}</h3>
          {/* <p className="text-gray-600 text-sm">{product.product_description}</p> */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-purple-700 font-semibold">₦{Number(product.product_price).toFixed(2)}
</span>
            <button className="bg-purple-700 text-white text-sm px-4 py-2 rounded hover:bg-purple-800 transition">
              Add to Cart
            </button>
            </div>
          </div>
          </Link>
        </div>
      ))}

      </div>
       )}
    </section>


   {/*reviews*/}
      <section className="py-16 bg-white">
        <h2 className="text-purple-800 text-2xl font-semibold text-center mb-8">What Our Clients Says</h2>
        {/*layout container*/}
        <div className="flex  flex-col md:flex-row items-center justify-center gap-6">
          {testimonials.map((testimonial, index) => (   
            <div
             key={index} 
             className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-6 w-full max-w-sm text-center">

              <div className="mb-2">
                <p className="text-sm font-semibold text-purple-700">
                {testimonial.name}</p>
                <div className="flex justify-center space-x-1 text-pink-500">
                {Array.from({ length:5 }).map((_, i) => (
                  <span key={i}>{i <testimonial.rating ? "★" : "☆"}</span>
                ))}
              </div>
              </div>
                  <p className="text-gray-600 text-sm">"{testimonial.quote}"</p>  
            </div>
          ))}
        </div>
      </section> 
 
      <section className="py-16 bg-gradient-to-r from-purple-800 to-pink-700 text-center">
            <h3 className="text-white text-2xl md:3xl font-semibold text-center mb-2">Join Our News Letter</h3>
            <p className="text-sm text-center text-white mb-6">Get exclusive offer and styling tips delivered to your inbox</p>
            <div className="flex justify-center  space-x-2">
            <input type="text" className="bg-white w-64 rounded-full text-center px-4 py-2 shadow-md border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400"placeholder="Enter your Email"/>
            <button  className="bg-pink-500 hover:bg-pink-500 text-white rounded-full text-sm font-semibold py-2 px-6">Subscribe</button>
            </div>
          </section> 


      </div>
      
      
  )
}
export default HomePage;
