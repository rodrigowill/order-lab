
export class NotFoundError extends Error{
    constructor(message: string){
        super(message)
        this.name = 'NotFoundError';
    }
}

export class InvalidOrderStepError extends Error{
    constructor (id: string, currentStatus:string){
        super(`Pedido ${id} não pode avançar a partir do estado ${currentStatus}.`);
        this.name = 'InvalidOrderStepError';
    }
}
