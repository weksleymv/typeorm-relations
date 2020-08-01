import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
// import Product from '@modules/products/infra/typeorm/entities/Product';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('Customer does not exists.');
    }

    const productsIds = products.map(product => {
      return { id: product.id };
    });

    const productsData = await this.productsRepository.findAllById(productsIds);

    if (!productsData || productsData.length === 0) {
      productsIds.forEach(prod => {
        throw new AppError(`Products not registered: ${prod.id}`);
      });
    }

    const listIdsProductDatabase = productsData.map(product => {
      return product.id;
    });

    const listProductsNotExists = productsIds.map(prod => {
      return !listIdsProductDatabase.includes(prod.id) ? prod.id : null;
    });

    if (listProductsNotExists) {
      listProductsNotExists.forEach(id => {
        if (id != null) {
          throw new AppError(`Products not registered: ${id}`);
        }
      });
    }

    const productsOrder = productsData.map(product => {
      return {
        product_id: product.id,
        price: product.price,
        quantity: products.find(prod => prod.id === product.id)?.quantity || 0,
      };
    });

    const order = await this.ordersRepository.create({
      customer,
      products: productsOrder,
    });

    await this.productsRepository.updateQuantity(products);

    order.customer = customer;

    return order;
  }
}

export default CreateOrderService;
