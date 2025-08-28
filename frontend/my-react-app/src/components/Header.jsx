import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';
import logo from '../assets/logo1.jpg'
import CartDrawer from "./CartDrawer";



const Header = () => {

const [isCartOpen, setIsCartOpen] = useState(false)
const [isMenuOpen, setIsMenuOpen] = useState(false)


    return (
        <header className="w-full bg-white  p-4 shadow  top-0 left-0 z-50">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
         {/* logo */}
        <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />

        {/* Hamburger icon for small screens*/}
        <div className="md:hidden">
            {isMenuOpen ? (
                <FiX className="text-purple w-6 h-6" onClick={()=> setIsMenuOpen(false)}></FiX>

            ):(
                <FiMenu className="text-purple w-6 h-6" onClick={()=> setIsMenuOpen(true)}></FiMenu>
            )}
        </div>


            {/* Desktop nav links */}
        <nav className="hidden md:flex space-x-6"> 
            <Link  to='/homepage' className="text-[#520c61] hover:text-gray-300">Home</Link>
            <Link  to='/collections' className="text-[#520c61]">Collections</Link>
            <Link  to='/salesproduct' className="text-[#520c61]">About Us</Link>
            <Link  to='/newinstock' className="text-[#520c61]">New In Stock</Link>
            <Link  to='/contactus' className="text-[#520c61]">Contact Us</Link>
        </nav>

        {/* desktop icons at the right side*/}
        <div className="flex items-center space-x-4">
        <FiSearch className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiSearch>
        <FiUser className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiUser>
        <FiShoppingCart 
        onClick={ () => setIsCartOpen(true)}
        className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiShoppingCart>
        </div>
        </div>



      {/* 🔧 Mobile nav menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2 space-y-2">
          <Link to='/homepage' className="block text-[#520c61]">Home</Link>
          <Link to='/collections' className="block text-[#520c61]">Collections</Link>
          <Link to='/salesproduct' className="block text-[#520c61]">About Us</Link>
          <Link to='/newinstock' className="block text-[#520c61]">New In Stock</Link>
          <Link to='/contactus' className="block text-[#520c61]">Contact Us</Link>
          <div className="flex space-x-4 mt-2">
            <FiSearch className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]" />
            <FiUser className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]" />
            <FiShoppingCart
              onClick={() => {
                setIsCartOpen(true);
                setIsMenuOpen(false); 
              }}
              className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"
            />
          </div>
        </div>
      )}


      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>
        </header>
    )
}

export default Header
