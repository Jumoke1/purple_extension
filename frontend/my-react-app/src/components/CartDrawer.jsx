import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose, refreshTrigger }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout', { state: {totalAmount: totalPrice}})
  }

  function getSessionId() {
    const sessionId = localStorage.getItem('session_id');
    if (sessionId) {
      return sessionId;
    } else {
      return "";
    }
  }

  useEffect(() => {
    if (isOpen) {
      console.log("Fetching cart data for session ID:", getSessionId());
      fetch(`http://127.0.0.1:5002/view_cart/${getSessionId()}`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to fetch cart data");
          }
          return res.json();
        })
        .then((data) => {
          console.log("Cart data:", data);
          setCartItems(data.cart || []);
        })
        .catch((err) => console.error("Error fetching cart:", err));
    }
  }, [isOpen, refreshTrigger]); // ✅ listens to refreshTrigger

  const totalPrice = cartItems.reduce((sum, item) => {
    return sum + item.quantity * item.product_price;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-white shadow-lg z-50 p-6 overflow-y-auto">
      <button onClick={onClose} className="text-gray-500 text-sm mb-4">
        Close
      </button>

      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cartItems.map((product) => (
          <div key={product.id} className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img
                src={`http://127.0.0.1:5002/${product.image_url}`}
                alt={product.product_name}
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-medium">{product.product_name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {product.quantity} × ₦{product.product_price}
                </p>
              </div>
            </div>
            <p className="font-semibold">
              ₦{(product.quantity * product.product_price).toFixed(2)}
            </p>
          </div>
        ))
      )}

      {cartItems.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total:</span>
            <span>₦{totalPrice.toFixed(2)}</span>
          </div>
          <button onClick={handleCheckout}
           className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
