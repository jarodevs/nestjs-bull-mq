export class EmissionRecordDTO {
	emissionGasName: string
	quantity: number
	unit: string
}

export class EmissionRecordAuditJob {
	emission_record_id: string
	audit_record_id: string
	created_at: number
	updated_at: number
	updated_fields: {
		emissionGasName: string
		quantity: number
		unit: string
	}
	emissionRecord: EmissionRecordDTO
}

export class EmissionRecordJob extends EmissionRecordDTO {
	emission_record_id: string
}
