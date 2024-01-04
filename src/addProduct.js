import React, { useState } from 'react';
import axios from 'axios';

const AddProductForm = ({ onProductAdded, setProducts }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Make sure to convert price and quantity to numbers if they are not already
      const formattedPrice = Number(price);
      const formattedQuantity = Number(quantity);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          description, 
          price: formattedPrice, 
          quantity: formattedQuantity 
        }),
      });

      if (response.ok) {
        onProductAdded();
        setName('');
        setDescription('');
        setPrice('');
        setQuantity('');

        // Update the products list after a successful request
        const productsResponse = await axios.get('/api/products');
        setProducts(productsResponse.data);
      } else {
        // Handle errors here, e.g., display an error message to the user
        console.error('Error adding product:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Product Name"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        required
      />
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        placeholder="Quantity"
        required
      />
      <button type="submit">Add Product</button>
    </form>
  );
};

export default AddProductForm;
