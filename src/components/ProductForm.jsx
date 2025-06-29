import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";
import { FaPlus, FaMinus } from "react-icons/fa";

const ProductForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [images, setImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([""]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

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

    if (id) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, "products", id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name);
            setDescription(data.description || "");
            setPrice(data.price.toString());
            setCategory(data.category);
            // Handle backward compatibility for imageUrl
            setImageUrls(data.imageUrls || [data.imageUrl || ""]);
          } else {
            setError("Product not found.");
          }
        } catch (err) {
          setError("Failed to load product: " + err.message);
        }
      };
      fetchProduct();
    }
  }, [id]);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return data.secure_url;
    } catch (err) {
      throw new Error("Image upload failed: " + err.message);
    }
  };

  const handleImageChange = async (index, file) => {
    if (!file) return;
    // Validate file extension
    const validExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      setError("Only JPG, JPEG, and PNG images are allowed.");
      return;
    }
    setError(""); // Clear any previous errors
    setUploading(true);
    try {
      const uploadedUrl = await handleImageUpload(file);
      const newImageUrls = [...imageUrls];
      newImageUrls[index] = uploadedUrl;
      setImageUrls(newImageUrls);
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = file;
        return newImages;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addImageField = () => {
    setImageUrls([...imageUrls, ""]);
    setImages([...images, null]);
  };

  const removeImageField = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
      setImages(images.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const filteredImageUrls = imageUrls.filter(url => url.trim() !== "");
      const productData = {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrls: filteredImageUrls.length > 0 ? filteredImageUrls : ["https://via.placeholder.com/400"],
      };
      await setDoc(doc(db, "products", id || Date.now().toString()), productData);
      toast.success(id ? "Product updated successfully!" : "Product added successfully!");
      navigate("/products");
    } catch (err) {
      setError("Failed to save product: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/products")}
            className="mr-4 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
          >
            Back
          </button>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Export Apparels Admin - {id ? "Edit Product" : "Add Product"}
          </h2>
        </div>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Price (Rs.)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
                step="0.01"
                required
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              rows="4"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Product Images (Optional)</label>
            <p className="text-gray-500 text-xs mb-2">Add images (JPG, JPEG, PNG) if desired; leave blank for default placeholder.</p>
            {imageUrls.map((url, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => handleImageChange(index, e.target.files[0])}
                  className="w-full p-3 border rounded-lg shadow-sm text-sm"
                />
                {imageUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(index)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <FaMinus />
                  </button>
                )}
                {uploading && index === imageUrls.length - 1 ? (
                  <div className="ml-2 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  url && (
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="ml-2 w-16 h-16 sm:w-20 sm:h-20 object-cover rounded"
                    />
                  )
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addImageField}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm mt-2"
            >
              <FaPlus className="mr-1" /> Add Another Image
            </button>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
            >
              {id ? "Update Product" : "Add Product"}
            </button>
            {id && (
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
