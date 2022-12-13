import {InjectQueue} from '@nestjs/bull';
import {Injectable} from '@nestjs/common';
import {Queue} from 'bull';


@Injectable()
export class MessageProducerService {
	constructor(@InjectQueue('message-queue') private queue: Queue) {}

	async sendMessage(message: string) {
		console.log(await this.queue.count())
		await this.queue.add('message-job', {
			message
		})
	}
}
