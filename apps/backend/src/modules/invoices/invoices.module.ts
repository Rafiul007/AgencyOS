import { Module } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { PublicInvoicesController } from './public-invoices.controller';
import { InvoicesService } from './invoices.service';

@Module({
  controllers: [InvoicesController, PublicInvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
