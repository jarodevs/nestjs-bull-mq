import {EmissionRecordDTO} from "./emission-record.dto"

export class EmissionRecordAudit {
	emission_record_id: string
	audit_record_id: string
	created_at: number
	updated_fields: {
		emissionGasName: string,
		quantity: number,
		unit: string
	}
	issuer: string
	emissionRecord: EmissionRecordDTO & {emission_record_id: string}
}

export class EmissionRecord extends EmissionRecordDTO {
	emission_record_id: string
}
