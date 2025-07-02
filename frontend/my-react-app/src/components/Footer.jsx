import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
    return (
        <footer className="w-full bg-purple-900 p-8 text-white">
            <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                <h2 className="text-xl font-bold mb-2">Purple Extension</h2>
                <p className="text-white">
                    Premium quality hair <br/> extension for queen 👑
                </p>
                </div>

                <div className="">
                    <h3 className="font-semibold mb-3">Helpful Links</h3>
                    <ul className="space-y-2">
                        <li><Link to='/about' className="text-gray-300 hover:text-white">About Us</Link></li>
                        <li><Link  to='/contact' className="test-gray-300 hover:text-white">Contact Us</Link> </li>
                        <li> <Link to='/faq' className="text-gray-300 hover:text-white">FAQs</Link> </li>
                    </ul>
                </div>

                 <div className="">
                    <h3 className="font-semibold mb-3">Follow Us</h3>
                    <ul className="space-y-2">
                         <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">Instagram</a></li>
                         <li><a href="https://wa.me/234..." target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">WhatsApp</a></li>
                        <li><a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white">TikTok</a></li>
                    </ul>
                 </div>

                 <div className="">
                    <h3 className="font-semibold mb-3">Contact</h3>
                    <div className="flex items-center gap-2 mb-2"><FiMail/><span>purpleextension@gmail.com</span></div>
                    <div className="flex items-center gap-2.5 mb-2"><FiPhone/><span>+234098765431</span></div>
                    <div className="flex items-center gap-2"><FiMapPin/><span>Lagos, Nigeria</span></div>
                 </div>
            </div>

        </footer>
    )
}
export default Footer;
