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
    
      const formattedPrice = parseFloat(price) * 100;
      const formattedQuantity = Number(quantity);

      const newProduct = {
        name,
        description,
        price: formattedPrice, 
        quantity: formattedQuantity,
      };

      const response = await axios.post('/api/products', newProduct);

      if (response.status === 201) {
    
        onProductAdded();
        setName('');
        setDescription('');
        setPrice('');
        setQuantity('');

       
        const productsResponse = await axios.get('/api/products');
        setProducts(productsResponse.data); 
      } else {
       
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
        placeholder="Price (in dollars)"
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
