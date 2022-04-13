import CampaignList from '../models/campaignList';
import Contact from '../models/contact';
import Client from '../models/client';
import { sendSMS } from '../controllers/twilioFunctions';
import { callWebhook } from '../controllers/webhook';
import PhoneMapping from '../models/phonemapping';
import Message from '../models/message';

export const JOB_NAME = 'CAMPAIGN_SCHEDULE';

export function jobFunction(agenda) {
	agenda.define(JOB_NAME, async (job, done) => {
		const { campaignId } = job.attrs.data;

		const campaign = await CampaignList.findOne({
			_id: campaignId,
			status: 'SCHEDULED',
		});

		if (!campaign) {
			return;
		}

		try {
			if (campaign.phoneNumbers.length === 0) {
				throw new Error('No contacts selected to send compaign');
			}

			const client = await Client.findById(campaign.client);
			if (!client) {
				throw new Error('Client not found');
			}

			let contacts = await Contact.find()
				.where('_id')
				.in(campaign.phoneNumbers)
				.exec();

			for (let contact of contacts) {
				let introMessage = campaign.title;
				introMessage = introMessage.replace(
					/{firstname}/g,
					contact.firstName
				);
				introMessage = introMessage.replace(
					/{lastname}/g,
					contact.lastName
				);
				introMessage = introMessage.replace(
					/{company}/g,
					contact.company ? contact.company : ''
				);

				let fpPhoneMapping = await PhoneMapping.findOne({
					userPhoneNumber: contact.phoneNumber,
					client: client._id,
				});

				let message = new Message({
					client: client._id,
					fromPhoneMapping: fpPhoneMapping ? fpPhoneMapping._id: null,
					toPhoneMapping: fpPhoneMapping ? fpPhoneMapping._id: null,
					message: introMessage,
					createdOn: Date.now(),
					campaign,
				});

				await message.save();

				await sendSMS(
					client.twilioPhoneNumber,
					contact.phoneNumber,
					introMessage,
					message._id
				);

				await callWebhook(client._id, 'SMS', {
					body: introMessage,
					from: client.twilioPhoneNumber,
					to: contact.phoneNumber,
				});
			}

			await CampaignList.updateOne(
				{ _id: campaign._id },
				{
					$set: {
						status: 'SENT',
					},
				},
				{ useFindAndModify: true }
			);
		} catch (error) {
			console.error(`Campaign send failed, reason is ${error.message}`);
			console.error(error);
			await CampaignList.updateOne(
				{ _id: campaign._id },
				{
					$set: {
						status: 'FAILED',
					},
				},
				{ useFindAndModify: true }
			);
		}

		done();
	});
}
