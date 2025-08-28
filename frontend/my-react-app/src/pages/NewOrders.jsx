import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function NewOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ordersPerPage = 10;

  const fetchOrders = (page) => {
    setLoading(true);
    fetch(`http://localhost:5002/orders?page=${page}&per_page=${ordersPerPage}`)
      .then((res) => res.json())
      .then((data) => {
        const orderData = data.orders || [];

        const formattedOrders = orderData.map((order) => ({
          id: order.id,
          status: order.status,
          total: order.amount,
          items: order.items || [],
          fullname: order.fullname,
          email: order.email,
          phone: order.phone,
          address: order.address,
          date: new Date(order.created_at),
        }));

        setOrders(formattedOrders);
        setTotalPages(data.total_pages || 1);
      })
      .catch((err) => {
        console.error("Error fetching orders:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="text-center mt-10 text-red-500">No orders found.</div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📦 Recent Orders</h1>
      <table className="w-full bg-white rounded-lg shadow-md">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Order ID</th>
            <th className="p-2 text-left">Customer</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">View</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t">
              <td className="p-2">#{order.id}</td>
              <td className="p-2">{order.fullname}</td>
              <td className="p-2">
                {order.date.toLocaleString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="p-2">
                <Link
                  to={`/singleorderdetails/${order.id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default NewOrder;
