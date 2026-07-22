import { Module } from '@nestjs/common';
import { QuotationsController } from './quotations.controller';
import { PublicQuotesController } from './public-quotes.controller';
import { QuotationsService } from './quotations.service';

@Module({
  controllers: [QuotationsController, PublicQuotesController],
  providers: [QuotationsService],
  exports: [QuotationsService],
})
export class QuotationsModule {}
