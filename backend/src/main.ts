import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProductHandler } from 'application/handler/product.handler';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      skipNullProperties: true
    })
  );

  const openApiConfig = new DocumentBuilder()
  .setTitle('Credit Payment API')
  .setDescription('Credit Payment API description')
  .setVersion('1.0')
  .addTag('credit-payment')
  .build();
  
  const document = SwaggerModule.createDocument(app, openApiConfig);
  SwaggerModule.setup('api', app, document);
  
  await app.get(ProductHandler).seedProduct();
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
