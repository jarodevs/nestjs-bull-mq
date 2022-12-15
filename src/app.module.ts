import {BullModule} from '@nestjs/bull';
import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {EmissionRecordProducerService} from './emission-record-producer/emission-record-producer.service';
import {EmissionRecordAuditConsumer} from './audit-consummer/audit-consumer';
import {EmissionRecordConsumer} from './emission-record-consummer/emission-record-consummer';

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
	providers: [AppService, EmissionRecordProducerService, EmissionRecordAuditConsumer, EmissionRecordConsumer],
})
export class AppModule {}
