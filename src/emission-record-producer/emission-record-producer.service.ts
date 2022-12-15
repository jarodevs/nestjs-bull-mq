import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';
import {EmissionRecordDTO} from '../emission-record.dto';
import {EmissionRecord, EmissionRecordAudit} from '../emission-record.entities'
import {randomUUID} from 'crypto';

@Injectable()
export class EmissionRecordProducerService {
	private readonly logger = new Logger(EmissionRecordProducerService.name);

	constructor(
		@InjectQueue('emission-record-audit') private readonly emissionRecordAuditQueue: Queue,
	) {}

	async processNewEmissionRecord(emissionRecord: EmissionRecordDTO, issuer: string): Promise<void> {
		this.logger.log(`[EmissionRecord:Producer] Start processing new emission record`)
		this.logger.log(`[EmissionRecord:Producer:Message] Sending audit message`)

		const datetime = new Date().getTime()
		const emissionRecordId = randomUUID()
		const auditRecordId = randomUUID()
		await this.emissionRecordAuditQueue.add('new-emission-record', {
			emission_record_id: emissionRecordId,
			audit_record_id: auditRecordId,
			created_at: datetime,
			updated_fields: {
				emissionGasName: emissionRecord.emissionGasName,
				quantity: emissionRecord.quantity,
				unit: emissionRecord.unit
			},
			issuer,
			emissionRecord
		} as EmissionRecordAudit)

		this.logger.log(`[EmissionRecord:Producer:Message] Audit message sent for EmissionRecord ${emissionRecordId} and Audit ${auditRecordId}`)
	}

	async updateEmissionRecord(emissionRecord: Partial<EmissionRecordDTO> & {emission_record_id?: string}, issuer: string): Promise<void> {
		this.logger.log(`[EmissionRecord:Producer] Start processing update of emission record`)
		this.logger.log(`[EmissionRecord:Producer:Message] Sending audit message`)

		if (!emissionRecord.emission_record_id) throw new BadRequestException('Missing emission_record_id')

		const datetime = new Date().getTime()
		const auditRecordId = randomUUID()
		const updated_fields = {} as Partial<EmissionRecordDTO>
		if (emissionRecord.emissionGasName) updated_fields.emissionGasName = emissionRecord.emissionGasName
		if (emissionRecord.quantity) updated_fields.quantity = emissionRecord.quantity
		if (emissionRecord.unit) updated_fields.unit = emissionRecord.unit
		await this.emissionRecordAuditQueue.add('new-emission-record', {
			emission_record_id: emissionRecord.emission_record_id,
			audit_record_id: auditRecordId,
			created_at: datetime,
			updated_fields,
			issuer,
			emissionRecord,
			updateOperation: true
		} as EmissionRecordAudit)

		this.logger.log(`[EmissionRecord:Producer:Message] Audit message sent for EmissionRecord ${emissionRecord.emission_record_id} and Audit ${auditRecordId}`)
	}
}
