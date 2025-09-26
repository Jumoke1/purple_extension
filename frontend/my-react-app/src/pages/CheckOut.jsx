import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const CheckOut = () => {
  const location = useLocation();
  const totalFromState = location.state?.totalAmount || 0;

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(totalFromState);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const [fullname, setfullName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');


  function getSessionId() {
    return localStorage.getItem('session_id') || '';
  }

  useEffect(() => {
    fetch(`http://127.0.0.1:5002/view_cart/${getSessionId()}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setCartItems(data.cart || []);
        const total = data.cart.reduce(
          (sum, item) => sum + item.quantity * item.product_price,
          0
        );
        setAmount(total);
         console.log('Cart data received:', data.cart);
          console.log('Cart items with color/length:', data.cart.map(item => ({
          name: item.product_name,
          color: item.selected_color,
          length: item.selected_length
        })));
      })
      .catch(err => console.error('Error fetching cart:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

        if (!email || !fullname || !address || !phone ){
          setError("please fill all requried fields")
          setLoading(false)
          return
        }
      const cartId = cartItems.length > 0 ? cartItems[0].cart_id : null;

      if (!cartId) {
        setError("Cart ID not found. Please refresh the page or add items again.");
        setLoading(false);
        return;
      }

    const orderData = {
      fullname: fullname, 
      email: email,
      phone: phone ,
      address:  address ,
      amount: amount,
      status: "Processing",
      cart_id: cartId,
      items: cartItems.map(item => ({
        product_id: item.product_id || item.id,
        quantity: item.quantity,
        price: item.product_price,
        selected_color: item.selected_color, 
        selected_length: item.selected_length
    }))
       

    };


    // DEBUG LOG 
    console.log('Order data being sent:', orderData);
    console.log('Cart items details:', cartItems.map(item => ({
      name: item.product_name,
      available_colors: item.colors,
      available_lengths: item.lengths,
      using_color: item.colors && item.colors.length > 0 ? item.colors[0] : 'Default Color',
      using_length: item.lengths && item.lengths.length > 0 ? item.lengths[0] : 'Default Length'
    })));
    try {
      //save the order details to the backend
        const orderResponse = await fetch("http://localhost:5002/create_order",{
        method: "POST",
        headers:{"Content-Type": "application/json"},
        body: JSON.stringify(orderData),
      });

      if (!orderResponse.ok) {
        throw new Error("failed  to create order")
      }

      const createdOrder = await orderResponse.json();

        const orderId = createdOrder.order_id || createdOrder.order?.id;
    
        if (!orderId) {
          throw new Error("Order ID not found in response");
        }


      //payment initialization
      const response = await fetch('http://localhost:5002/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          fullname,
          amount: Number(amount),
          order_id: orderId
        }),
      });

      if (!response.ok) {
        throw new Error('Network issue or payment service error');
      }

      const { authorization_url } = await response.json();
      window.location.href = authorization_url;

    } catch (err) {
      console.error('Payment failed:', err);
      setError('Payment initialization failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-purple-100 min-h-screen flex p-6 space-x-6">
      {/* DELIVERY DETAILS */}
      <div className="w-1/2 bg-white rounded-lg shadow px-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="p-4">
          <h2 className="text-lg text-purple-600 font-semibold mb-6">DELIVERY DETAILS</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="px-4 py-3 w-full border border-purple-300 mb-4 rounded-lg"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">Fullname</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => setfullName(e.target.value)}
              placeholder="Enter your firstname & lastname"
              className="px-4 py-3 w-full border border-purple-300 mb-4 rounded-lg"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your full address"
              className="px-4 py-3 w-full border border-purple-300 mb-4 rounded-lg"
            />

            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e)  => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="px-4 py-3 w-full border border-purple-300 mb-8 rounded-lg"
            />

            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 rounded-lg w-full px-4 py-3 text-white font-semibold text-xl"
            >
          
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </form>
      </div>

      {/* ORDER SUMMARY */}
      <div className="w-1/2 bg-white rounded-lg shadow px-6 py-6">
        <h2 className="text-lg font-semibold text-purple-600 mb-6">ORDER SUMMARY</h2>

        {cartItems.map(product => (
          <div key={product.id} className="flex items-center justify-between mb-4">
            <img
              src={`http://127.0.0.1:5002/${product.image_url}`}
              alt={product.product_name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="ml-4 flex-1">
              <p className="font-medium">{product.product_name}</p>
              <p className="text-sm text-gray-600">
                Qty: {product.quantity} × ₦{product.product_price}
              </p>
            </div>
            <p className="font-semibold">
              ₦{(product.quantity * product.product_price).toFixed(2)}
            </p>
          </div>
        ))}

        <div className="border-t pt-4 mt-6 flex justify-between text-lg font-bold">
          <span>Total:</span>
          <span>₦{amount.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
};

export default CheckOut;
