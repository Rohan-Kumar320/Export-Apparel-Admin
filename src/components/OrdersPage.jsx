import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError("");
      console.log("Fetching orders from Firestore...");
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersList);
        console.log("Orders fetched:", ordersList);
        toast.success("Orders loaded successfully!", { position: "bottom-right" });
      } catch (err) {
        console.error("Orders fetch error:", err);
        if (err.code === "permission-denied") {
          setError(
            "Permission denied. Please ensure you have access to view orders or contact support."
          );
          toast.error(
            "Permission denied. Please check Firestore permissions or contact support.",
            { position: "bottom-right" }
          );
        } else {
          setError("Failed to load orders: " + err.message);
          toast.error("Failed to load orders: " + err.message, {
            position: "bottom-right",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    console.log(`Updating order ${id} to status: ${newStatus}`);
    try {
      await updateDoc(doc(db, "orders", id), { status: newStatus });
      setOrders(
        orders.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      toast.success(`Order ${id} updated to ${newStatus}!`, {
        position: "bottom-right",
      });
      console.log(`Order ${id} updated to ${newStatus}`);
    } catch (err) {
      console.error("Status update error:", err);
      if (err.code === "permission-denied") {
        setError(
          "Permission denied. Please ensure you have write access to update orders."
        );
        toast.error(
          "Permission denied. Please check Firestore permissions or contact support.",
          { position: "bottom-right" }
        );
      } else {
        setError("Failed to update order: " + err.message);
        toast.error("Failed to update order: " + err.message, {
          position: "bottom-right",
        });
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(
    (order) =>
      (order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName &&
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (filterStatus === "" || order.status === filterStatus)
  );

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "-100vw" }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="min-h-screen bg-gray-100 flex justify-center"
    >
      <div className="container mx-auto p-4 sm:p-8 max-w-4xl">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="mr-4 bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 transition text-sm sm:text-base"
          >
            Back to Dashboard
          </button>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Orders Management
          </h2>
        </div>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        {isLoading && (
          <p className="text-gray-600 text-sm text-center">Loading orders...</p>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-1/2 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-1/4 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="bg-white rounded-lg shadow-md border border-dashed border-gray-300 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-3 sm:p-4 text-left text-sm sm:text-base">
                  Order ID
                </th>
                <th className="p-3 sm:p-4 text-left text-sm sm:text-base">
                  Customer
                </th>
                <th className="p-3 sm:p-4 text-left text-sm sm:text-base">
                  Total
                </th>
                <th className="p-3 sm:p-4 text-left text-sm sm:text-base">
                  Status
                </th>
                <th className="p-3 sm:p-4 text-right text-sm sm:text-base">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 sm:p-4 text-sm sm:text-base">{order.id}</td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">
                    {order.customerName || "N/A"}
                  </td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">
                    Rs. {(order.total || 0).toFixed(2)}
                  </td>
                  <td className="p-3 sm:p-4 text-sm sm:text-base">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(
                        order.status || "Pending"
                      )}`}
                    >
                      {order.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3 sm:p-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Details
                    </button>
                    <select
                      value={order.status || "Pending"}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="p-1 sm:p-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AnimatePresence>
          {selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Order Details - {selectedOrder.id}
                </h3>
                <div className="text-sm sm:text-base mb-4">
                  <p>
                    <strong>Customer:</strong> {selectedOrder.customerName || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedOrder.email || "Not provided"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedOrder.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Address:</strong> {selectedOrder.address || "N/A"}
                  </p>
                  {selectedOrder.additionalMessage && (
                    <p>
                      <strong>Additional Message:</strong>{" "}
                      {selectedOrder.additionalMessage}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>
                    <span
                      className={`inline-block ml-2 px-3 py-1 rounded-full text-sm ${getStatusColor(
                        selectedOrder.status || "Pending"
                      )}`}
                    >
                      {selectedOrder.status || "Pending"}
                    </span>
                  </p>
                  <p>
                    <strong>Placed On:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
                <h4 className="text-base font-semibold text-gray-800 mb-2">
                  Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-gray-700">
                        <th className="p-3 text-left text-sm sm:text-base">
                          Image
                        </th>
                        <th className="p-3 text-left text-sm sm:text-base">
                          Name
                        </th>
                        <th className="p-3 text-left text-sm sm:text-base">
                          Quantity
                        </th>
                        <th className="p-3 text-left text-sm sm:text-base">
                          Price
                        </th>
                        <th className="p-3 text-left text-sm sm:text-base">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">
                            <img
                              src={
                                item.imageUrl || "https://via.placeholder.com/400"
                              }
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </td>
                          <td className="p-3 text-sm sm:text-base">
                            {item.name || "N/A"}
                          </td>
                          <td className="p-3 text-sm sm:text-base">
                            {item.quantity || 0}
                          </td>
                          <td className="p-3 text-sm sm:text-base">
                            Rs. {(item.price || 0).toFixed(2)}
                          </td>
                          <td className="p-3 text-sm sm:text-base">
                            Rs. {(item.price * item.quantity || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4">
                  <p className="text-lg font-bold text-gray-800">
                    Total: Rs. {(selectedOrder.total || 0).toFixed(2)}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default OrdersPage;