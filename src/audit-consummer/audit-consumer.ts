import {InjectQueue, Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job, Queue} from "bull";
import * as path from "path";
import * as fs from "fs";
import {EmissionRecord, EmissionRecordAudit, EmissionRecordAuditSavedJob} from "src/emission-record.entities";

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
	async saveNewEmissionRecordAudit({data}: Job<EmissionRecordAudit>) {
		this.logger.log(`[EmissionRecord:Consummer:Audit] Receive Emission Record ${data.emission_record_id} and Audit ${data.audit_record_id}`)
		// get mock db file
		const auditDb = fs.readFileSync(this.auditDbFile, {encoding: 'utf8'})
		const auditObject = {
			emission_record_id: data.emission_record_id,
			audit_record_id: data.audit_record_id,
			created_at: data.created_at,
			updated_fields: data.updated_fields,
			issuer: data.issuer
		}
		let dataToWrite: string;
		if (!auditDb || !JSON.parse(auditDb).audits) {
			dataToWrite = JSON.stringify({
				audits: [
					auditObject
				]
			})
		} else {
			const parsedAuditDb = JSON.parse(auditDb)
			parsedAuditDb.audits.push(auditObject)
			dataToWrite = JSON.stringify(parsedAuditDb)
		}

		fs.writeFileSync(this.auditDbFile, dataToWrite)
		this.logger.log(`[EmissionRecord:Consummer:Audit] Audit saved`)
		const auditSaveJob: EmissionRecordAuditSavedJob = {
			emission_record_id: data.emission_record_id,
			...data.emissionRecord,
			updateMode: data.updateOperation ?? false
		}
		await this.emissionRecordAuditQueue.add('emission-record-audit-saved', auditSaveJob)

		this.logger.log(`[EmissionRecord:Consummer:Audit] Emission record ${data.emission_record_id} sent for saving`)
	}

	@Process('emission-record-audit-saved')
	async saveNewEmissionRecord({data}: Job<EmissionRecordAuditSavedJob>) {
		this.logger.log(`[EmissionRecord:Consummer:Record] Receive Emission Record ${data.emission_record_id}`)
		try {
			// get mock db file
			const emissionRecordDb = fs.readFileSync(this.emissionRecordDbFile, {encoding: 'utf8'})
			let dataToWrite: string;
			if (!data.updateMode) {
				if (!emissionRecordDb || !JSON.parse(emissionRecordDb).records) {
					dataToWrite = JSON.stringify({
						records: [
							data
						]
					})
				} else {
					const parsedEmissionRecordDb = JSON.parse(emissionRecordDb)
					parsedEmissionRecordDb.records.push(data)
					dataToWrite = JSON.stringify(parsedEmissionRecordDb)
				}
			} else {
				const parsedEmissionRecordDb = JSON.parse(emissionRecordDb)
				parsedEmissionRecordDb.records = parsedEmissionRecordDb.records.map((el) => {
					if (el.emission_record_id === data.emission_record_id) {
						if (data.emissionGasName) el.emissionGasName = data.emissionGasName
						if (data.quantity) el.quantity = data.quantity
						if (data.unit) el.unit = data.unit
					}
					return el
				})
				dataToWrite = JSON.stringify(parsedEmissionRecordDb)
			}

			fs.writeFileSync(this.emissionRecordDbFile, dataToWrite)
			this.logger.log(`[EmissionRecord:Consummer:Record] Record saved`)
		} catch (e) {
			this.logger.log(e)
			this.logger.log(`[EmissionRecord:Consummer:Record] Error saving Emission record ${data.emission_record_id}. Rolling back`)
			this.emissionRecordQueue.add('emission-record-save-failure', {emission_record_id: data.emission_record_id})
		}

	}
}
