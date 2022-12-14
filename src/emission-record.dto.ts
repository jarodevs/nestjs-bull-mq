export class EmissionRecordDTO {
	emissionGasName: string
	quantity: number
	unit: string
	metadata?: Record<string, unknown>
}
