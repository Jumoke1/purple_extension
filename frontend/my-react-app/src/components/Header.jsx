import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiUser, FiShoppingCart } from 'react-icons/fi';
import logo from '../assets/logo1.jpg'
import CartDrawer from "./CartDrawer";



const Header = () => {

const [isCartOpen, setIsCartOpen] = useState(false)

    return (
        <header className="w-full bg=white  p-4 shadow">
        <div className="flex justify-between items-center max-w-screen-xl mx-auto">
         {/* logo */}
        <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
        <div className="text-white text-2xl font-bold">
            {/*name */}
        </div>
            {/* nav links */}
        <nav className="flex space-x-6"> 
            <Link  to='/homepage' className="text-[#520c61] hover:text-gray-300">Home</Link>
            <Link  to='/collections' className="text-[#520c61]">Collections</Link>
            <Link  to='/salesproduct' className="text-[#520c61]">About Us</Link>
            <Link  to='/newinstock' className="text-[#520c61]">New In Stock</Link>
            <Link  to='/contactus' className="text-[#520c61]">Contact Us</Link>
        </nav>

        {/*icons at the right side*/}
        <div className="flex items-center space-x-4">
        <FiSearch className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiSearch>
        <FiUser className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiUser>
        <FiShoppingCart 
        onClick={ () => setIsCartOpen(true)}
        className="text-purple w-6 h-6 cursor-pointer hover:text-[#e46bbf]"></FiShoppingCart>
        </div>
        </div>
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)}/>
        </header>
    )
}

export default Header
// const Header = () => {
//     return (
//         <nav className="bg-[#F8D8DE] p-4">
//             <div className="flex justify-between items-center w-full">
//                 {/* Logo */}
//                 <div className="text-white text-2xl font-bold">
//                     MyLogo
//                 </div>

//                 {/* Nav Links */}
//                 <div className="flex space-x-6">
//                     <Link to='/home' className="text-white hover:text-gray-300">Home</Link>
//                     <Link to='/collections' className="text-white hover:text-gray-300">Collections</Link>
//                     <Link to='/salesproduct' className="text-white hover:text-gray-300">Sales Product</Link>
//                     <Link to='/newinstock' className="text-white hover:text-gray-300">New In Stock</Link>
//                     <Link to='/contactus' className="text-white hover:text-gray-300">Contact Us</Link>
//                 </div>

//                 {/* Icons */}
//                 <div className="flex items-center space-x-4">
//                     <FiSearch className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//                     <FiUser className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//                     <FiShoppingCart className="text-white w-6 h-6 cursor-pointer hover:text-gray-300" />
//                 </div>
//             </div>
//         </nav>
//     );
// };

// export default Header;
