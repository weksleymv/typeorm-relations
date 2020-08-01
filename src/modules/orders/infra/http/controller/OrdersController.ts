import { Request, Response } from 'express';

import { container } from 'tsyringe';

import CreateOrderService from '@modules/orders/services/CreateOrderService';
import FindOrderService from '@modules/orders/services/FindOrderService';

export default class OrdersController {
  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const findOrder = container.resolve(FindOrderService);

    const order = await findOrder.execute({ id });

    return response.json(order);
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { customer_id, products } = request.body;

    const createOrder = container.resolve(CreateOrderService);

    try {
      const order = await createOrder.execute({ customer_id, products });

      const { id, created_at, updated_at, customer, order_products } = order;

      return response.status(200).json({
        id,
        created_at,
        updated_at,
        customer,
        order_products,
      });
    } catch (err) {
      return response.status(400).json({ Error: err.message });
    }
  }
}
