import { ProductPersistencePort } from '../../spi/product.persistence.port';
import { ProductUseCase } from './product.usecase';
import { productSeed, seedProducts } from '../../seed/product.seed';
import { Product } from '../../model/product.model';
import { ProductNotFoundException } from '../../exception/product.not.found.exception';
import { ExceptionConstant } from '../../constant/exception.constants';

describe('ProductUseCase', () => {
  let productUseCase: ProductUseCase;
  let productPersistencePort: jest.Mocked<ProductPersistencePort>;

  beforeEach(() => {
    // Create mock for ProductPersistencePort
    productPersistencePort = {
      getProducts: jest.fn(),
      seedProducts: jest.fn(),
    } as jest.Mocked<ProductPersistencePort>;

    // Create ProductUseCase instance with mocked dependency
    productUseCase = new ProductUseCase(productPersistencePort);
  });

  it('should return products when products exists', async () => {
    const products: Product[] = seedProducts(5);
    jest.spyOn(productPersistencePort, 'getProducts').mockResolvedValue(products);

    const result = await productUseCase.getProducts();

    expect(result).toEqual(products);
  });

  it('should throw ProductsNotFoundException when products do not exists', async () => {
    jest.spyOn(productPersistencePort, 'getProducts').mockResolvedValue(null);

    await expect(productUseCase.getProducts()).rejects.toThrow(ProductNotFoundException);
    await expect(productUseCase.getProducts()).rejects.toThrow(
      ExceptionConstant.PRODUCTS_NOT_FOUND_MESSAGE,
    );
  });

  it('should seed products when no products exists', async () => {
    jest.spyOn(productPersistencePort, 'getProducts').mockResolvedValue(null);
    jest.spyOn(productPersistencePort, 'seedProducts').mockResolvedValue();

    await productUseCase.seedProducts();

    expect(productPersistencePort.seedProducts).toHaveBeenCalledWith(productSeed);
  });

  it('should not seed product when products exists', async () => {
    const product: Product[] = [
      {
        id: '1',
        name: 'Product 1',
        description: 'Description',
        price: 100,
        stock: 2,
        image: 'mock.png',
      },
    ];
    jest.spyOn(productPersistencePort, 'getProducts').mockResolvedValue(product);

    const resultPromise = productUseCase.seedProducts();

    await expect(resultPromise).resolves.toBeUndefined();
    expect(productPersistencePort.seedProducts).not.toHaveBeenCalled();
  });
});
