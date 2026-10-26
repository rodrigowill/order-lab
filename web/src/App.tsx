import { useEffect, useState } from "react";
import { fetchOrders } from "./api.js";
import { NewOrderForm } from "./components/NewOrderForm.js";
import { OrderList } from "./components/OrderList.js";
import type { Order } from "./types.js";


export default function App() {
  const [orders, setOrders] = useState<Order[]>([]);

  async function load() {
    const data = await fetchOrders();
    setOrders(data);
  }

  useEffect(() => {
    fetchOrders().then(setOrders);
  }, []);

  return (
    <div>
      <h1>Order Lab</h1>
      <NewOrderForm onCreated={load} />
      <h2>Pedidos</h2>
      <OrderList orders={orders} onAction={load} />
    </div>
  );
}