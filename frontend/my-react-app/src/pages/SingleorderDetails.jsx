import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function OrderDetails() {
  const { orderId } = useParams();  // get order ID from URL
  const [order, setOrder] = useState(null);  // holds fetched order
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    fetch(`http://localhost:5002/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        const formattedOrder = {
          id: data.id,
          status: data.status,
          total: data.total_amount,
          items: JSON.parse(data.items || "[]"),
          customer: {
            name: data.fullname,
            email: data.email,
            phone: data.phone,
          },
          delivery: {
            address: data.address,
          },
        };
        setOrder(formattedOrder);
      })
      .catch((err) => {
        console.error("Error fetching order:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [orderId]);

  if (loading) {
    return <div className="text-center mt-10 text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return <div className="text-center mt-10 text-red-500">Order not found.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Order #{order.id}</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Products</h3>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between border-b pb-2">
              <span>{item.name} × {item.quantity}</span>
              <span>₦{item.price.toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-right font-bold">
          Total: ₦{order.total?.toLocaleString()}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Delivery Details</h3>
        <p><strong>Name:</strong> {order.customer.name}</p>
        <p><strong>Phone:</strong> {order.customer.phone}</p>
        <p><strong>Address:</strong> {order.delivery.address}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Order Status</h3>
        <p className="inline-block px-3 py-1 rounded-full text-white bg-blue-600">{order.status}</p>
      </div>
    </div>
  );
}

export default OrderDetails;
