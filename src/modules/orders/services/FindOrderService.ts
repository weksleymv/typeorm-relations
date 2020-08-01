import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IRequest {
  id: string;
}

@injectable()
class FindOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ id }: IRequest): Promise<Order | undefined> {
    const order = await this.ordersRepository.findById(id);

    if (!order?.customer_id) {
      throw new AppError(
        "Customer's information is not present in the database",
      );
    }

    const customer = await this.customersRepository.findById(
      order?.customer_id,
    );

    if (!customer) {
      throw new AppError('Customer not found');
    }
    order.customer = customer;

    return order;
  }
}

export default FindOrderService;
