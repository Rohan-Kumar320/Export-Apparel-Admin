// src/components/CategoriesPage.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const categoriesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(categoriesList);
      } catch (err) {
        setError("Failed to load categories: " + err.message);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, "categories", id));
        setCategories(categories.filter(category => category.id !== id));
      } catch (err) {
        setError("Failed to delete category: " + err.message);
      }
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="mr-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm sm:text-base"
        >
          Back to Dashboard
        </button>
        <h2 className="text-xl sm:text-2xl font-bold">Categories</h2>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search by category name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <Link to="/categories/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm sm:text-base">
          Add New Category
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 sm:p-4 text-left text-sm sm:text-base">Name</th>
              <th className="p-3 sm:p-4 text-right text-sm sm:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => (
              <tr key={category.id} className="border-b">
                <td className="p-3 sm:p-4 text-sm sm:text-base">{category.name}</td>
                <td className="p-3 sm:p-4 text-right">
                  <Link
                    to={`/categories/edit/${category.id}`}
                    className="text-yellow-500 hover:underline mr-2 sm:mr-4 text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-500 hover:underline text-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoriesPage;