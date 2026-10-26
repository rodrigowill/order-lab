import type { Order } from "./types.js";

const BASE = 'http://localhost:3000';

export async function fetchOrders(): Promise<Order[]> {
    const res = await fetch(`${BASE}/orders`);
    return res.json();
}

export async function createOrder(data: {
    name: string;
    description: string;
    value: number;
}): Promise<Order> {
    const res = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function acceptOrder(id: string): Promise<void>{
    const res = await fetch(`${BASE}/orders/${id}/accept`, {method: 'POST'});
    if (!res.ok) throw new Error(await res.text());
}

export async function prepareOrder(id: string): Promise<void>{
    const res = await fetch(`${BASE}/orders/${id}/prepare`, {method: 'POST'});
    if (!res.ok) throw new Error(await res.text());
}

export async function deliverOrder(id: string): Promise<void>{
    const res = await fetch(`${BASE}/orders/${id}/deliver`, {method: 'POST'});
    if (!res.ok) throw new Error(await res.text());
}
