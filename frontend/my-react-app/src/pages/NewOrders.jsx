import { useState, useEffect } from "react";
import { Link } from "react-router-dom";


 function NewOrder() {
 const [orders, setOrders] = useState([]);
 const [loading, setLoading] = useState(true); 

 
useEffect(() => {
    fetch(`http://localhost:5002/orders`)
      .then((res) => res.json())
      .then((data) => {
        const formattedOrders = data.map((order) => ({
          id: order.id,
          status: order.status,
          total: order.total_amount,
          items: order.items || "[]",
          fullname: order.fullname,
          email: order.email,
          phone: order.phone,
          address: order.address,
          date: order.created_at, // you need to format if needed
        }));

          setOrders(formattedOrders);
        })
      .catch((err) => {
        console.error("Error fetching order:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

if (!loading && orders.length === 0) {
  return <div className="text-center mt-10 text-red-500">No orders found.</div>;
}


  if (!orders) {
    return <div className="text-center mt-10 text-red-500">Order not found.</div>;
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
              <td className="p-2">{order.date.toLocaleString()}</td>
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
    </div>
  );
} 
export default NewOrder;