import { Module } from '@nestjs/common';
import configuration from './app/configuration';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './app/data.source.options';
import { ProductController } from './infrastructure/in/http/controller/product.controller';
import { ProductHandler } from 'application/handler/product.handler';
import { ProductUseCase } from 'domain/api/usecase/product.usecase';
import { ProductServicePort } from 'domain/api/product.service.port';
import { ProductRepository } from './infrastructure/out/postgres/repository/product.repository';
import { ProductExceptionHandler } from './infrastructure/in/http/exceptionhandler/product.exception.handler';
import { ProductPersistencePort } from 'domain/spi/product.persistence.port';
import { ProductAdapter } from './infrastructure/out/postgres/adapter/product.adapter';
import { ProductEntity } from './infrastructure/out/postgres/entity/product.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV || '.env',
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([ProductEntity])
  ],
  controllers: [ProductController],
  providers: [
    ProductHandler,
    ProductRepository,
    ProductExceptionHandler,
    {
      provide: ProductPersistencePort,
      useFactory: (repo: ProductRepository) => new ProductAdapter(repo), 
      inject: [ProductRepository]
    },
    {
      provide: ProductServicePort,
      useFactory: (adapter: ProductPersistencePort) => new ProductUseCase(adapter),
      inject: [ProductPersistencePort]
    }
  ],
  exports: [ProductServicePort]
})
export class AppModule {}
