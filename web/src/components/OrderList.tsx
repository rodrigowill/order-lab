import type { Order } from "../types.js";
import { acceptOrder, deliverOrder, prepareOrder } from "../api.js";

const NEXT_ACTION: Record<Order['status'], { label: string; fn: (id: string) => Promise<void> } | null> = {
    INCLUDED:  { label: 'Aceitar',   fn: acceptOrder },
    RECEIVED:  { label: 'Preparar',  fn: prepareOrder },
    PREPARED:  { label: 'Entregar',  fn: deliverOrder },
    DELIVERED: null,
}

const STATUS_LABEL: Record<Order['status'], string> = {
  INCLUDED:  'Colocado',
  RECEIVED:  'Recebido',
  PREPARED:  'Preparado',
  DELIVERED: 'Entregue',
};

interface Props {
    orders: Order[];
    onAction: () => void;
}

export function OrderList({ orders, onAction }: Props) {
    async function handleAction(id: string, fn: (id: string) => Promise<void>) {
        try {
            await fn(id);
            setTimeout(onAction, 1500);
        } catch (err) {
            alert(err.message);
        }
    }

    if (orders.length === 0) return <p>Nenhum pedido ainda.</p>;

    return (
        <ul>
            {orders.map(order => {
                const action = NEXT_ACTION[order.status];
                return (
                    <li key={order.id}>
                        <strong>{order.name}</strong> - {order.description} - R$ {order.value}
                        <span>[{STATUS_LABEL[order.status]}]</span>
                        {action && (
                            <button onClick={() => handleAction(order.id, action.fn)}>
                                {action.label}
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    )
}
