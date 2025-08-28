import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="w-64 bg-white h-screen rounded-2xl p-6 shadow-md">
    
      <ul className="space-y-4">
        <li>
          <Link to="/productmanagement" className="text-purple-600 hover:text-purple-800 font-semibold">All Products
          </Link>
        </li>
        <li>
          <Link to="/addnewproduct" className="text-purple-600 hover:text-purple-800 font-semibold">Add Product</Link>
        </li>
         <li>
          <Link to="/clientcomplaint" className="text-purple-600 hover:text-purple-800 font-semibold">Client Complain</Link>
        </li>
        
        
      </ul>
    </div>
  );
}
