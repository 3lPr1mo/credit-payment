import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsEmail, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CustomerRequest {
    @ApiProperty({
        name: 'name',
        type: String,
        required: true,
        description: 'Name of the customer',
        example: 'Juan Carlos',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        name: 'lastName',
        type: String,
        required: true,
        description: 'Last name of the customer',
        example: 'González',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        name: 'dni',
        type: String,
        required: true,
        description: 'Identification number of the customer',
        example: '12345678',
    })
    @IsString()
    @IsNotEmpty()
    dni: string;

    @ApiProperty({
        name: 'phone',
        type: String,
        required: true,
        description: 'Phone number of the customer',
        example: '+573001234567',
    })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        name: 'email',
        type: String,
        required: true,
        description: 'Email of the customer',
        example: 'juan.gonzalez@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}

export class DeliveryRequest {
    @ApiProperty({
        name: 'address',
        type: String,
        required: true,
        description: 'Delivery address',
        example: 'Calle 123 #45-67',
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        name: 'country',
        type: String,
        required: true,
        description: 'Country for delivery',
        example: 'Colombia',
    })
    @IsString()
    @IsNotEmpty()
    country: string;

    @ApiProperty({
        name: 'city',
        type: String,
        required: true,
        description: 'City for delivery',
        example: 'Bogotá',
    })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({
        name: 'region',
        type: String,
        required: true,
        description: 'Region or state for delivery',
        example: 'Cundinamarca',
    })
    @IsString()
    @IsNotEmpty()
    region: string;

    @ApiProperty({
        name: 'postalCode',
        type: String,
        required: true,
        description: 'Postal code for delivery',
        example: '110111',
    })
    @IsString()
    @IsNotEmpty()
    postalCode: string;

    @ApiProperty({
        name: 'destinataireName',
        type: String,
        required: true,
        description: 'Name of the person receiving the delivery',
        example: 'Juan Carlos González',
    })
    @IsString()
    @IsNotEmpty()
    destinataireName: string;
}

export class StartOrderTransactionRequest {
    @ApiProperty({
        name: 'quantity',
        type: Number,
        required: true,
        description: 'Quantity of the product',
        example: 2,
    })
    @IsNumber()
    @IsNotEmpty()
    quantity: number;

    @ApiProperty({
        name: 'customer',
        type: CustomerRequest,
        required: true,
        description: 'Customer information',
    })
    @ValidateNested()
    @Type(() => CustomerRequest)
    @IsNotEmpty()
    customer: CustomerRequest;

    @ApiProperty({
        name: 'productId',
        type: String,
        required: true,
        description: 'ID of the product to order',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsNotEmpty()
    productId: string;

    @ApiProperty({
        name: 'delivery',
        type: DeliveryRequest,
        required: true,
        description: 'Delivery information',
    })
    @ValidateNested()
    @Type(() => DeliveryRequest)
    @IsNotEmpty()
    delivery: DeliveryRequest;
}