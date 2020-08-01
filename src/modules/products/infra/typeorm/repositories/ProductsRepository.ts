import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';
import AppError from '@shared/errors/AppError';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({
      name,
      price,
      quantity,
    });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const findProduct = await this.ormRepository.findOne({
      where: { name },
    });

    return findProduct;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const listIds = products.map(product => product.id);
    const findProducts = await this.ormRepository.find({
      where: { id: In(listIds) },
    });

    return findProducts;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsData = await this.findAllById(products);

    const productsUpdate = await productsData.map(product => {
      const updateProduct = product;
      const infoProduct = products.find(prod => prod.id === product.id);
      if (infoProduct && infoProduct.quantity < updateProduct.quantity){
        updateProduct.quantity -= infoProduct?.quantity;
      } else {
        throw new AppError(`Insufficient quantities for product ${updateProduct.name}`);
      }

      return updateProduct;
    });

    await this.ormRepository.save(productsUpdate);

    return productsUpdate;
  }
}

export default ProductsRepository;
