 import { Link } from "react-router-dom";
 function Navbar() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <div className="text-xl font-bold text-purple-700">Dashboard</div>
      <nav className="space-x-4">
        <Link to='/productmanagement' className="text-gray-600 hover:text-purle-600">Products</Link>
        <Link to='/' className="text-gray-600 hover:text-purple-600">Orders</Link>
        <Link className="text-gray-600 hover:text-purple-600">Users</Link>
      </nav>
    </header>
  );
}
export default Navbar;
