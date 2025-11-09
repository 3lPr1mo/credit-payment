import { ApiProperty } from '@nestjs/swagger';

export class GetProductReponse {
  @ApiProperty({
    example: '1',
    description: 'Unique identifier for product',
  })
  id: string;

  @ApiProperty({
    example: 'Laptop Dell XPS 15',
    description: 'Name of the product',
  })
  name: string;

  @ApiProperty({
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
    description: 'Detailed description of the product',
  })
  description: string;

  @ApiProperty({
    example: 1299.99,
    description: 'Price of the product in USD',
  })
  price: number;

  @ApiProperty({
    example: 50,
    description: 'Available stock quantity',
  })
  stock: number;

  @ApiProperty({
    example: 'https://example.com/images/laptop.jpg',
    description: 'URL of the product image',
    required: false,
  })
  image?: string;
}
