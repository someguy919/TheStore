import React from 'react';

const Products = ({ products, cartItems, createLineItem, updateLineItem })=> {
  // sort alphabetically
  const sortedProducts = products.sort((a, b) => {
    const nameA = a.name.toLowerCase(); 
    const nameB = b.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }) ;

//Function to format the price 

const formatPrice = (priceInCents) => {
  return `$${(priceInCents / 100).toFixed(2)}`;
}
  
  return (
    <div>
      <h2>Products</h2>
      <ul>
        {
          sortedProducts.map( product => {
            const cartItem = cartItems.find(lineItem => lineItem.product_id === product.id);
            return (
              <li key={ product.id }>
                  <div>
                    <strong>{product.name}</strong> - {formatPrice(product.price)}
                    <br/>
                    Quantity: {product.quantity}
                    <div>{product.description}</div> 
                  </div>
                {
                  cartItem ? 
                  <button onClick={ ()=> updateLineItem(cartItem)}>Add Another</button>: 
                  <button onClick={ ()=> createLineItem(product)}>Add</button>
                }
              </li>
            );
          })
        }
      </ul>
    </div>
  );
};

export default Products;
