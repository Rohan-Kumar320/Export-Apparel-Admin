// src/components/ProductsPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(productsList);

        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesList);

        setLoading(false);
      } catch (err) {
        setError("Failed to load data: " + err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts(products.filter(product => product.id !== id));
        toast.success("Product deleted successfully!");
      } catch (err) {
        setError("Failed to delete product: " + err.message);
      }
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === "" || product.category === filterCategory)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Export Apparels Admin - Products
          </h2>
        </div>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-1/4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
          <Link
            to="/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
          >
            Add New Product
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-gray-200 p-4 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Image</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Name</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Description</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Price (Rs.)</th>
                    <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Category</th>
                    <th className="p-3 sm:p-4 text-right text-sm sm:text-base">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 sm:p-4">
                        <img
                          src={product.imageUrls?.[0] || product.imageUrl || "https://via.placeholder.com/50"}
                          alt={product.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                        />
                      </td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{product.name}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{product.description || "N/A"}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">Rs. {product.price.toFixed(2)}</td>
                      <td className="p-3 sm:p-4 text-sm sm:text-base">{product.category}</td>
                      <td className="p-3 sm:p-4 text-right">
                        <Link
                          to={`/products/edit/${product.id}`}
                          className="text-blue-600 hover:text-blue-700 mr-4"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;