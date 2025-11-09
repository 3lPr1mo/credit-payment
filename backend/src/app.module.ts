import { Module } from '@nestjs/common';
import { CreditPaymentModule } from './credit.payment.module';

@Module({
  imports: [
    CreditPaymentModule
  ]
})
export class AppModule {}
