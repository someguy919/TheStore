const {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  createProduct,
} = require('./db');

const express = require('express');
const app = express.Router();

app.post('/products', async (req, res, next) => {
  try {
    // Validate the request body
    const { name, price, quantity, description } = req.body;
    if (!name || !price || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create the product
    const product = await createProduct(req.body);

    // Send a success response
    res.status(201).send(product);
  } catch (error) {
    // Handle errors
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/products', async(req, res, next)=> {
  try {
    res.send(await fetchProducts());
  }
  catch(ex){
    next(ex);
  }
});

app.put('/orders/:id', async(req, res, next)=> {
  try {
    res.send(await updateOrder({ ...req.body, id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

app.get('/orders', async(req, res, next)=> {
  try {
    res.send(await fetchOrders());
  }
  catch(ex){
    next(ex);
  }
});

app.get('/lineItems', async(req, res, next)=> {
  try {
    res.send(await fetchLineItems());
  }
  catch(ex){
    next(ex);
  }
});

app.post('/lineItems', async(req, res, next)=> {
  try {
    res.send(await createLineItem(req.body));
  }
  catch(ex){
    next(ex);
  }
});

app.put('/lineItems/:id', async(req, res, next)=> {
  try {
    res.send(await updateLineItem({...req.body, id: req.params.id}));
  }
  catch(ex){
    next(ex);
  }
});

app.delete('/lineItems/:id', async(req, res, next)=> {
  try {
    await deleteLineItem({ id: req.params.id });
    res.sendStatus(204);
  }
  catch(ex){
    next(ex);
  }
});

module.exports = app;
