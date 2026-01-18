import { ApiProperty } from '@nestjs/swagger';

export class ProductOrderTransactionResponse {
  @ApiProperty({
    description: 'Unique identifier of the product',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the product',
    example: 'Laptop Dell XPS 15',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'High-performance laptop with 16GB RAM and 512GB SSD',
  })
  description: string;

  @ApiProperty({
    description: 'Price of the product in cents',
    example: 299999,
  })
  price: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/images/laptop-dell-xps15.jpg',
  })
  image: string;
}

export class DeliveryOrderTransactionResponse {
  @ApiProperty({
    description: 'Delivery address',
    example: 'Calle 123 #45-67, Apartamento 8B',
  })
  address: string;

  @ApiProperty({
    description: 'Delivery country',
    example: 'Colombia',
  })
  country: string;

  @ApiProperty({
    description: 'Delivery city',
    example: 'Bogotá',
  })
  city: string;

  @ApiProperty({
    description: 'Delivery region or state',
    example: 'Cundinamarca',
  })
  region: string;

  @ApiProperty({
    description: 'Postal code for delivery',
    example: '110111',
  })
  postalCode: string;

  @ApiProperty({
    description: 'Name of the person receiving the delivery',
    example: 'Juan Carlos González',
  })
  destinataireName: string;
}

export class CustomerOrderTransactionResponse {
  @ApiProperty({
    description: 'Customer first name',
    example: 'Juan Carlos',
  })
  name: string;

  @ApiProperty({
    description: 'Customer last name',
    example: 'González Pérez',
  })
  lastName: string;

  @ApiProperty({
    description: 'Customer identification number',
    example: '12345678901',
  })
  dni: string;

  @ApiProperty({
    description: 'Customer phone number',
    example: '+573001234567',
  })
  phone: string;

  @ApiProperty({
    description: 'Customer email address',
    example: 'juan.gonzalez@example.com',
  })
  email: string;
}

export class OrderTransactionResponse {
  @ApiProperty({
    description: 'Unique identifier of the order transaction',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Payment gateway transaction identifier',
    example: 'txn_wompi_123456789',
  })
  paymentGatewayTransactionId: string;

  @ApiProperty({
    description: 'Quantity of products ordered',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Product information',
    type: ProductOrderTransactionResponse,
  })
  product: ProductOrderTransactionResponse;

  @ApiProperty({
    description: 'Delivery information',
    type: DeliveryOrderTransactionResponse,
  })
  delivery: DeliveryOrderTransactionResponse;

  @ApiProperty({
    description: 'Total amount in cents',
    example: 599998,
  })
  total: number;

  @ApiProperty({
    description: 'Current status of the transaction',
    example: 'PENDING',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'],
  })
  status: string;

  @ApiProperty({
    description: 'Transaction creation timestamp',
    example: '2024-12-08T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Customer information',
    type: CustomerOrderTransactionResponse,
  })
  customer: CustomerOrderTransactionResponse;

  @ApiProperty({
    description: 'IVA percentage',
    example: 0.19,
  })
  iva?: number;
}