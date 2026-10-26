import { useState } from "react";
import { createOrder } from "../api.js";


interface Props {
    onCreated: () => void;
}

export function NewOrderForm({onCreated}: Props) {
    const [name, setName]               = useState('');
    const [description, setDescription] = useState('');
    const [value, setValue]             = useState('');
    const [error, setError]             = useState('');

    async function handleSubmit(e: React.SyntheticEvent) {
        e.preventDefault();
        setError('');
        try {
            await createOrder({name, description, value:Number(value)});
            setName('');
            setDescription('');
            setValue('');
            onCreated();
        } catch(err) {
            setError(err.message);
        }

    }
    return (
        <form onSubmit={handleSubmit}>
            <h2>Novo Pedido</h2>
            <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required/>
            <input placeholder="O que pediu" value={description} onChange={e => setDescription(e.target.value)} required/>
            <input placeholder="Valor" type="number"step="0.01" value={value} onChange={e => setValue(e.target.value)} required/>
            <button type="submit">Anotar</button>
            {error && <p style={{color: 'red'}}>{error}</p>}
        </form>
    );
}
