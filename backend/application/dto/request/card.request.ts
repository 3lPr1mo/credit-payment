import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty,
  IsCreditCard, 
  MaxLength,
  MinLength
} from 'class-validator';

export class CardRequest {
  @ApiProperty({
    description: 'Credit card number (16 digits)',
    example: '4111111111111111',
    minLength: 13,
    maxLength: 19,
  })
  @IsCreditCard()
  number: string;

  @ApiProperty({
    description: 'Card verification code (3 digits)',
    example: '123',
    minLength: 3,
    maxLength: 4,
  })
  @IsString()
  @MaxLength(3)
  cvc: string;

  @ApiProperty({
    description: 'Expiration month (MM format: 01-12)',
    example: '12',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @MaxLength(2)
  @MinLength(2)
  expMonth: string;

  @ApiProperty({
    description: 'Expiration year (YY format)',
    example: '29',
    minLength: 2,
    maxLength: 2,
  })
  @IsString()
  @MaxLength(2)
  @MinLength(2)
  expYear: string;

  @ApiProperty({
    description: 'Cardholder name as it appears on the card',
    example: 'JUAN CARLOS GONZALEZ',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  cardHolder: string;
}