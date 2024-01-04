const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_store_db');
const { v4 } = require('uuid');
const uuidv4 = v4;


const fetchLineItems = async()=> {
  const SQL = `
    SELECT *
    FROM
    line_items
    ORDER BY product_id
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const fetchProducts = async()=> {
  const SQL = `
    SELECT *
    FROM products
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createProduct = async(product)=> {
  const SQL = `
    INSERT INTO products (id, name, price, quantity, description)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const response = await client.query(SQL, [ uuidv4(), product.name, product.price, product.quantity, product.description]);
  return response.rows[0];
};

const ensureCart = async(lineItem)=> {
  let orderId = lineItem.order_id;
  if(!orderId){
    const SQL = `
      SELECT order_id 
      FROM line_items 
      WHERE id = $1 
    `;
    const response = await client.query(SQL, [lineItem.id]);
    orderId = response.rows[0].order_id;
  }
  const SQL = `
    SELECT * 
    FROM orders
    WHERE id = $1 and is_cart=true
  `;
  const response = await client.query(SQL, [orderId]);
  if(!response.rows.length){
    throw Error("An order which has been placed can not be changed");
  }
};
const updateLineItem = async(lineItem) => {
  await ensureCart(lineItem);
  const SQL = `
    UPDATE line_items
    SET quantity = $1
    WHERE id = $2
    RETURNING *
  `;
  if (lineItem.quantity <= 0) {
    throw Error('a line item quantity must be greater than 0');
  }
  const response = await client.query(SQL, [lineItem.quantity, lineItem.id]);
  return response.rows[0];
};


const createLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
  INSERT INTO line_items (product_id, order_id, id) 
  VALUES($1, $2, $3) 
  RETURNING *
`;
 response = await client.query(SQL, [ lineItem.product_id, lineItem.order_id, uuidv4()]);
  return response.rows[0];
};

const deleteLineItem = async(lineItem)=> {
  await ensureCart(lineItem);
  const SQL = `
    DELETE from line_items
    WHERE id = $1
  `;
  await client.query(SQL, [lineItem.id]);
};

const updateOrder = async(order)=> {
  const SQL = `
    UPDATE orders 
    SET is_cart = $1 
    WHERE id = $2 RETURNING *
  `;
  const response = await client.query(SQL, [order.is_cart, order.id]);
  return response.rows[0];
};

const fetchOrders = async()=> {
  const SQL = `
    SELECT * 
    FROM orders;
  `;
  const response = await client.query(SQL);
  const cart = response.rows.find(row => row.is_cart);
  if(!cart){
    await client.query('INSERT INTO orders(is_cart, id) VALUES(true, $1)', [uuidv4()]); 
    return fetchOrders();
  }
  return response.rows;
};

const seed = async()=> {
  const SQL = `
    DROP TABLE IF EXISTS line_items;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS orders;

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      name VARCHAR(100) UNIQUE NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      description TEXT 
    );

    CREATE TABLE orders(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      is_cart BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE line_items(
      id UUID PRIMARY KEY,
      created_at TIMESTAMP DEFAULT now(),
      product_id UUID REFERENCES products(id) NOT NULL,
      order_id UUID REFERENCES orders(id) NOT NULL,
      quantity INTEGER DEFAULT 1,
      CONSTRAINT product_and_order_key UNIQUE(product_id, order_id)
    );

  `;
  await client.query(SQL);
  const [foo, bar, bazz, quq] = await Promise.all([
    createProduct({ name: 'foo', price: 100, quantity: 420, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu lobortis dui. Quisque ac velit aliquet, consequat dui non, fringilla enim. Nunc mattis lacus quis erat pulvinar posuere. Sed id tellus condimentum, volutpat nibh non, dapibus est. Pellentesque tristique tincidunt purus ut tincidunt. Curabitur vehicula, arcu in consectetur tempus, purus dolor mattis arcu, vitae mollis turpis odio ac dui. Sed pellentesque at enim vitae facilisis. Curabitur molestie faucibus egestas. Sed non lectus lobortis, commodo erat sed, ullamcorper orci. Aenean ullamcorper ultricies est non dictum. Donec pulvinar vestibulum nunc nec condimentum.' }),
    createProduct({ name: 'bar', price: 200, quantity: 69, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu lobortis dui. Quisque ac velit aliquet, consequat dui non, fringilla enim. Nunc mattis lacus quis erat pulvinar posuere. Sed id tellus condimentum, volutpat nibh non, dapibus est. Pellentesque tristique tincidunt purus ut tincidunt. Curabitur vehicula, arcu in consectetur tempus, purus dolor mattis arcu, vitae mollis turpis odio ac dui. Sed pellentesque at enim vitae facilisis. Curabitur molestie faucibus egestas. Sed non lectus lobortis, commodo erat sed, ullamcorper orci. Aenean ullamcorper ultricies est non dictum. Donec pulvinar vestibulum nunc nec condimentum.' }),
    createProduct({ name: 'bazz', price: 150, quantity: 420, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu lobortis dui. Quisque ac velit aliquet, consequat dui non, fringilla enim. Nunc mattis lacus quis erat pulvinar posuere. Sed id tellus condimentum, volutpat nibh non, dapibus est. Pellentesque tristique tincidunt purus ut tincidunt. Curabitur vehicula, arcu in consectetur tempus, purus dolor mattis arcu, vitae mollis turpis odio ac dui. Sed pellentesque at enim vitae facilisis. Curabitur molestie faucibus egestas. Sed non lectus lobortis, commodo erat sed, ullamcorper orci. Aenean ullamcorper ultricies est non dictum. Donec pulvinar vestibulum nunc nec condimentum.' }),
    createProduct({ name: 'quq', price: 375, quantity: 69, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eu lobortis dui. Quisque ac velit aliquet, consequat dui non, fringilla enim. Nunc mattis lacus quis erat pulvinar posuere. Sed id tellus condimentum, volutpat nibh non, dapibus est. Pellentesque tristique tincidunt purus ut tincidunt. Curabitur vehicula, arcu in consectetur tempus, purus dolor mattis arcu, vitae mollis turpis odio ac dui. Sed pellentesque at enim vitae facilisis. Curabitur molestie faucibus egestas. Sed non lectus lobortis, commodo erat sed, ullamcorper orci. Aenean ullamcorper ultricies est non dictum. Donec pulvinar vestibulum nunc nec condimentum.' }),
  ]);
  let orders = await fetchOrders();
  let cart = orders.find(order => order.is_cart);
  let lineItem = await createLineItem({ order_id: cart.id, product_id: foo.id});
  lineItem.quantity++;
  await updateLineItem(lineItem);
  cart.is_cart = false;
  await updateOrder(cart);
};

module.exports = {
  fetchProducts,
  fetchOrders,
  fetchLineItems,
  createLineItem,
  updateLineItem,
  deleteLineItem,
  updateOrder,
  seed,
  createProduct,
  client
};
