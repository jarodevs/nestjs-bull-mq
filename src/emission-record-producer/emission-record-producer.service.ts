import {Injectable, Logger} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';
import {EmissionRecordDTO} from 'src/emission-record.dto';
import {randomUUID} from 'crypto';

@Injectable()
export class EmissionRecordProducerService {
	private readonly logger = new Logger(EmissionRecordProducerService.name);

	constructor(
		@InjectQueue('emission-record') private readonly emissionRecordQueue: Queue,
		@InjectQueue('emission-record-audit') private readonly emissionRecordAuditQueue: Queue,
	) {}

	async processNewEmissionRecord(emissionRecord: EmissionRecordDTO): Promise<void> {
		//TODO: Get updater info, not in emission record, another property
		//TODO Delete metadata from emissionRecord
		this.logger.log(`[EmissionRecord:Producer] Start processing new emission record`)
		this.logger.log(`[EmissionRecord:Producer:Message] Sending audit message`)

		const datetime = new Date().getTime()
		const emissionRecordId = randomUUID()
		this.emissionRecordAuditQueue.add('new-emission-record', {
			emission_record_id: emissionRecordId,
			audit_record_id: randomUUID(),
			created_at: datetime,
			updated_at: datetime,
			updated_fields: {
				...emissionRecord
			}
		})
	}
}
