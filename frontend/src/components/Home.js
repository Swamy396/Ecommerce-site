import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Home.css";
import OrderForm from "./OrderForm"; 

function Home({ user }) {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8888/products")
      .then(res => {
        if (res.data.status === "success") {
          setProducts(res.data.products);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddToCart = (product_id) => {
    if (!user) {
      setMessage("Please login to add items to cart.");
      return;
    }

    axios.post("http://localhost:8888/cart/add", {
      user_id: user.user_id,
      product_id
    })
      .then(res => {
        if (res.data.status === "success") {
          setMessage("Product added to cart.");
        } else {
          setMessage(res.data.message);
        }
      })
      .catch(err => {
        setMessage("Error adding product to cart.");
        console.error(err);
      });
  };

  const handleOrderClick = (product) => {
    if (!user) {
      setMessage("Please login to place an order.");
      return;
    }
    setSelectedProduct(product);
    setShowOrderForm(true);
  };

  const categories = ["All", "Electronics", "Makeup", "Bags"];

  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>My Products</h2>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search for products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="categories-container">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={selectedCategory === cat ? "selected" : ""}
            >
              {cat}
            </button>
          ))}
        </div>

        {message && <p className="message">{message}</p>}
      </div>

      <div className="products-container">
        {filteredProducts.map(p => (
          <div key={p.productid} className="product-card">
            <img src={p.image} alt={p.name} />
            <h4>{p.name}</h4>
            <p>Category: {p.category}</p>
            <p>Price: ₹{(p.price * 80).toFixed(2)}</p>

            <div className="button-stack">
              <button onClick={() => handleAddToCart(p.productid)}>Add to Cart</button><p></p>
              <button className="order-btn" onClick={() => handleOrderClick(p)}>Order</button>
            </div>
          </div>
        ))}
      </div>

      {showOrderForm && selectedProduct && (
        <OrderForm
          product={selectedProduct}
          user={user}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}

export default Home;
