import {Body, Controller, Post, Put} from '@nestjs/common';
import {EmissionRecordProducerService} from './emission-record-producer/emission-record-producer.service';
import {EmissionRecordDTO} from './emission-record.dto';

@Controller()
export class AppController {
	constructor(readonly emissionRecordProducerService: EmissionRecordProducerService) {
	}

	@Post('emission-record')
	async processEmissionRecord(@Body() body: {emissionRecord: EmissionRecordDTO, issuer: string}): Promise<void> {
		await this.emissionRecordProducerService.processNewEmissionRecord(body.emissionRecord, body.issuer)
	}

	@Put('emission-record')
	async updateEmissionRecord(@Body() body: {emissionRecord: Partial<EmissionRecordDTO> & {emission_record_id: string}, issuer: string}): Promise<void> {
		return await this.emissionRecordProducerService.updateEmissionRecord(body.emissionRecord, body.issuer)
	}
}
