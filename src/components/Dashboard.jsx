import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("Logged out successfully");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold">Export Apparel Admin Panel</h1>
          {/* Hamburger Menu Icon for Small Screens */}
          <button
            className="sm:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          {/* Navbar for Larger Screens */}
          <div className="hidden sm:flex sm:space-x-4">
            <Link to="/dashboard" className="hover:underline text-sm sm:text-base">Dashboard</Link>
            <Link to="/products" className="hover:underline text-sm sm:text-base">Products</Link>
            <Link to="/categories" className="hover:underline text-sm sm:text-base">Categories</Link>
            <Link to="/orders" className="hover:underline text-sm sm:text-base">Orders</Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm sm:text-base"
            >
              Logout
            </button>
          </div>
        </div>
        {/* Dropdown Menu for Small Screens */}
        {isMenuOpen && (
          <div className="sm:hidden bg-blue-700 p-4 flex flex-col space-y-2">
            <Link to="/dashboard" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
            <Link to="/products" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/categories" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Categories</Link>
            <Link to="/orders" className="hover:underline text-sm" onClick={() => setIsMenuOpen(false)}>Orders</Link>
            <button
              onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600 text-sm text-left"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      <div className="container mx-auto p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Admin Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link
            to="/products"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Manage Products</h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Add, edit, or delete clothing products</p>
          </Link>
          <Link
            to="/categories"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Manage Categories</h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Organize products by categories</p>
          </Link>
          <Link
            to="/orders"
            className="bg-white p-4 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition text-center"
          >
            <h3 className="text-lg sm:text-xl font-semibold text-blue-600">Manage Orders</h3>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">View and update customer orders</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;