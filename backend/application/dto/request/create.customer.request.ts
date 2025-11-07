import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCustomerRequest {
  @ApiProperty({
    name: 'name',
    type: String,
    required: true,
    description: 'Name of the customer',
    example: 'Juan',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    name: 'last name',
    type: String,
    required: true,
    description: 'Last name of the customer',
    example: 'Perez',
  })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    name: 'Identification Number',
    type: String,
    required: true,
    description: 'Identification number of the customer',
    example: '32154231',
  })
  @IsNotEmpty()
  dni: string;

  @ApiProperty({
    name: 'Phone',
    type: String,
    required: true,
    description: 'Phone of the customer',
    example: '3143667777',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    name: 'Email',
    type: String,
    required: true,
    description: 'Email of the customer',
    example: 'example@gmail.com',
  })
  @IsEmail()
  email: string;
}
