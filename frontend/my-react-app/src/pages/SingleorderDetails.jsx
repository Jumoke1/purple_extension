import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function SingleOrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`http://localhost:5002/orders/${orderId}`);
        
        if (!response.ok) {
          throw new Error(`Order not found (status: ${response.status})`);
        }
        
        const orderData = await response.json();
        
        setOrder({
          ...orderData,
          total: orderData.amount || orderData.items.reduce(
            (total, item) => total + (item.price * item.quantity), 0
          )
        });
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const updateOrderStatus = async(orderId, newStatus)=> {
    try{
      const response = await fetch(`http://localhost:5002/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({status: newStatus}),
      }
    )
    if (!response.ok){
      throw new Error('failed to updateo rderstatus')
    }
        setOrder(prev => ({ ...prev, status: newStatus }));

    }  catch (err) {
    console.error("Error updating order status:", err);
    alert("Failed to update order status");
  }

  }
  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!order) return <div className="text-center py-8">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Order #{order.id}</h1>
        
        {/* Order Status */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
           <select
              value={order.status}
              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="cancelled">Refunded</option>
            </select>

            <div className={`px-3 py-1 rounded-full text-white ${
              order.paid ? 'bg-green-500' : 'bg-yellow-500'
            }`}>
              <p>Payment Status: {order.paid ? "✅ Paid" : "⏳ Pending"}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          {order.items.map(item => (
            <div key={item.id} className="flex border-b py-4">
              {item.image_url && (
                <img 
                  src={`http://127.0.0.1:5002/${item.image_url}`}
                  alt={item.product_name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">{item.product_name}</h3>
                <p className="text-gray-600">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p>₦{(item.price * item.quantity).toLocaleString()}</p>
              </div>
            </div>
          ))}
          <div className="text-right mt-4 font-bold">
            Total: ₦{order.total.toLocaleString()}
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Customer</h2>
            <p>{order.fullname}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Delivery</h2>
            <p>{order.address}</p>
            {order.reference && (
              <p className="mt-2">
                <span className="font-medium">Reference:</span> {order.reference}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleOrderDetails;