import {BullModule} from '@nestjs/bull';
import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {MessageConsumer} from './message-consumer/message-consumer';
import {EmissionRecordProducerService} from './emission-record-producer/emission-record-producer.service';

@Module({
	imports: [
		BullModule.forRoot({
			redis: {
				host: 'localhost',
				port: 6379,
			},
		}),
		BullModule.registerQueue({
			name: 'emission-record',
		}),
		BullModule.registerQueue({
			name: 'emission-record-audit',
		}),
	],
	exports: [BullModule],
	controllers: [AppController],
	providers: [AppService, MessageConsumer, EmissionRecordProducerService],
})
export class AppModule {}
