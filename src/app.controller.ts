import {Controller, Logger, Post} from '@nestjs/common';
import {EmissionRecordProducerService} from './emission-record-producer/emission-record-producer.service';
import {EmissionRecordDTO} from './emission-record.dto';

@Controller()
export class AppController {
	constructor(readonly emissionRecordProducerService: EmissionRecordProducerService) {
	}

	@Post('emission-record')
	async processEmissionRecord(emissionRecord: EmissionRecordDTO): Promise<EmissionRecordDTO> {
		this.emissionRecordProducerService.processNewEmissionRecord(emissionRecord)
		return emissionRecord
	}
}
