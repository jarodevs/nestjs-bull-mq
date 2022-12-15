import {Body, Controller, Logger, Post} from '@nestjs/common';
import {EmissionRecordProducerService} from './emission-record-producer/emission-record-producer.service';
import {EmissionRecordDTO} from './emission-record.dto';

@Controller()
export class AppController {
	constructor(readonly emissionRecordProducerService: EmissionRecordProducerService) {
	}

	@Post('emission-record')
	async processEmissionRecord(@Body() body: {emissionRecord: EmissionRecordDTO, issuer: string}): Promise<EmissionRecordDTO> {
		this.emissionRecordProducerService.processNewEmissionRecord(body.emissionRecord, body.issuer)
		return body.emissionRecord
	}
}
