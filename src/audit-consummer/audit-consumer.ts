import {InjectQueue, Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job, Queue} from "bull";
import * as path from "path";
import * as fs from "fs";
import {EmissionRecordAuditJob, EmissionRecordJob} from "src/emission-record.dto";

@Processor('emission-record-audit')
export class EmissionRecordAuditConsumer {
	private readonly logger: Logger = new Logger(EmissionRecordAuditConsumer.name)
	private readonly auditDbFile = path.resolve(__dirname, '../../audit-db-file.json')
	private readonly emissionRecordDbFile = path.resolve(__dirname, '../../emission-record-db-file.json')

	constructor(
		@InjectQueue('emission-record-audit') private readonly emissionRecordAuditQueue: Queue,
		@InjectQueue('emission-record') private readonly emissionRecordQueue: Queue,
	) {}

	@Process('new-emission-record')
	async saveNewEmissionRecordAudit({data}: Job<EmissionRecordAuditJob>) {
		this.logger.log(`[EmissionRecord:Consummer:Audit] Receive Emission Record ${data.emission_record_id} and Audit ${data.audit_record_id}`)
		// get mock db file
		const auditDb = fs.readFileSync(this.auditDbFile, {encoding: 'utf8'})
		let dataToWrite: string;
		if (!auditDb || !JSON.parse(auditDb).audits) {
			dataToWrite = JSON.stringify({
				audits: [
					data
				]
			})
		} else {
			const parsedAuditDb = JSON.parse(auditDb)
			parsedAuditDb.audits.push(data)
			dataToWrite = JSON.stringify(parsedAuditDb)
		}

		fs.writeFileSync(this.auditDbFile, dataToWrite)
		this.logger.log(`[EmissionRecord:Consummer:Audit] Audit saved`)
		await this.emissionRecordAuditQueue.add('emission-record-audit-saved', {
			emission_record_id: data.emission_record_id,
			...data.emissionRecord
		})

		this.logger.log(`[EmissionRecord:Consummer:Audit] Emission record ${data.emission_record_id} sent for saving`)
	}

	@Process('emission-record-audit-saved')
	async saveNewEmissionRecord({data}: Job<EmissionRecordJob>) {
		this.logger.log(`[EmissionRecord:Consummer:Record] Receive Emission Record ${data.emission_record_id}`)
		try {
			// get mock db file
			const emissionRecordDb = fs.readFileSync(this.emissionRecordDbFile, {encoding: 'utf8'})
			let dataToWrite: string;
			if (!emissionRecordDb || !JSON.parse(emissionRecordDb).records) {
				dataToWrite = JSON.stringify({
					records: [
						data
					]
				})
			} else {
				const parsedEmissionRecordDb = JSON.parse(emissionRecordDb)
				parsedEmissionRecordDb.audits.push(data)
				dataToWrite = JSON.stringify(parsedEmissionRecordDb)
			}

			fs.writeFileSync(this.emissionRecordDbFile, dataToWrite)
			this.logger.log(`[EmissionRecord:Consummer:Record] Record saved`)
		} catch (e) {
			this.logger.log(`[EmissionRecord:Consummer:Record] Error saving Emission record ${data.emission_record_id}. Rolling back`)
			this.logger.log(e)
			this.emissionRecordQueue.add('emission-record-save-failure', {emission_record_id: data.emission_record_id})
		}

	}
}
