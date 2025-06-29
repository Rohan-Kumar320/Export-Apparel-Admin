// src/components/CategoryForm.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

const CategoryForm = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        try {
          const docRef = doc(db, "categories", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setName(docSnap.data().name);
          } else {
            setError("Category not found.");
          }
        } catch (err) {
          setError("Failed to load category: " + err.message);
        }
      };
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await setDoc(doc(db, "categories", id || Date.now().toString()), { name });
      toast.success(id ? "Category updated successfully!" : "Category added successfully!");
      navigate("/categories");
    } catch (err) {
      setError("Failed to save category: " + err.message);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/categories")}
          className="mr-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600 text-sm sm:text-base"
        >
          Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold">{id ? "Edit Category" : "Add Category"}</h2>
      </div>
      {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm">Category Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition text-sm"
        >
          {id ? "Update Category" : "Add Category"}
        </button>
      </form>
    </div>
  );
};

export default CategoryForm;