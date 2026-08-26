import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { WebhookController } from './controllers/webhook.controller';
import { ClerkWebhookService } from './services/clerk-webhook.service';

@Module({
  imports: [UserModule],
  controllers: [WebhookController],
  providers: [ClerkWebhookService],
})
export class WebhookModule {}
