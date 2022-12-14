import {Process, Processor} from "@nestjs/bull";
import {Logger} from "@nestjs/common";
import {Job} from "bull";
import * as path from "path";
import * as fs from "fs";
import {EmissionRecordJob} from "src/emission-record.dto";

@Processor('emission-record')
export class EmissionRecordConsumer {
	private readonly logger: Logger = new Logger(EmissionRecordConsumer.name)
	private readonly auditDbFile = path.resolve(__dirname, '../../audit-db-file.json')


	@Process('emission-record-save-failure')
	async rollbackAuditSave({data}: Job<{emission_record_id: string}>): Promise<void> {
		this.logger.log(`[EmissionRecord:Consummer:Record] Receive Emission Record save failure for record ${data.emission_record_id}. \nRemoving audit`)
		const auditDb = fs.readFileSync(this.auditDbFile, {encoding: 'utf8'})

		if (!auditDb || !JSON.parse(auditDb).audits) return

		const parsedAuditDb = JSON.parse(auditDb)
		parsedAuditDb.audits.splice(parsedAuditDb.audits.findIndex((el) => el.emission_record_id === data.emission_record_id), 1)
		fs.writeFileSync(this.auditDbFile, JSON.stringify(parsedAuditDb))
	}
}
