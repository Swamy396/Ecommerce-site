import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Cart({ user }) {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setMessage("Please login to view your cart.");
      return;
    }

    axios.get(`http://localhost:8888/cart/${user.user_id}`)
      .then(res => {
        if (res.data.status === "success") {
          setCartItems(res.data.cart);
          setMessage("");
        } else {
          setMessage(res.data.message);
        }
      })
      .catch(err => {
        setMessage("Failed to fetch cart items.");
        console.error(err);
      });
  }, [user]);

  const handleRemove = (product_id) => {
    axios.delete("http://localhost:8888/cart", { data: { user_id: user.user_id, product_id } })
      .then(res => {
        if (res.data.status === "success") {
          setCartItems(prev => prev.filter(item => item.productid !== product_id));
          setMessage("Product removed from cart.");
        } else {
          setMessage(res.data.message);
        }
      })
      .catch(err => {
        setMessage("Failed to remove product.");
        console.error(err);
      });
  };

  if (!user) {
    return <p>{message}</p>;
  }

  return (
    <div>
      <h2>My Cart</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.productid} style={{ border: "1px solid #ccc", padding: 10, margin: 10, width: 300 }}>
              <img src={item.image} alt={item.name} style={{ width: "100%", height: 150, objectFit: "cover" }} />
              <h4>{item.name}</h4>
              <p>Category: {item.category}</p>
              <p>Price: ${item.price}</p>
              <button onClick={() => handleRemove(item.productid)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Cart;

