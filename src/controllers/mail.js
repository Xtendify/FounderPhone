import Mailchimp from 'mailchimp-api-v3';
import SendGridMail from '@sendgrid/mail';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import SibApiV3Sdk from "sib-api-v3-sdk";

require('dotenv').config();

SendGridMail.setApiKey(process.env.SENDGRID_API_KEY);

export const addToMailchimp = async (client) => {
	const mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);

	console.log(`Syncing with Mailchimp for ${client.email}`);
	return mailchimp
		.post('/lists/3aa6984241/members', {
			email_address: client.email,
			status: 'subscribed',
			merge_fields: {
				SIGNEDUPON: client.signedupOn,
				PLAN: client.billingDetails.currentPlan,
				TWILIOPHON: client.twilioPhoneNumber,
			},
		})
		.catch((err) => {
			console.log(err.message);
		});
};

export const addToSIB = async (client) => {
	const defaultClient = SibApiV3Sdk.ApiClient.instance;
	const apiKey = defaultClient.authentications['api-key'];
	apiKey.apiKey = process.env.SENDINBLUE_API_KEY;
	const apiInstance = new SibApiV3Sdk.ContactsApi();

	const createContact = new SibApiV3Sdk.CreateContact();

	createContact.email = client.email;
	createContact.listIds = [40];
	createContact.updateEnabled = true;
	createContact.attributes = {
		FP_SIGNED_UP_ON: client.signedupOn || "",
		FP_PLAN: client.billingDetails.currentPlan,
		FP_TWILIO_NUMBER: client.twilioPhoneNumber,
		FP_LAST_LOGIN_ON: client.lastLoggedInOn || client.signedupOn || ""
	};

	return apiInstance.createContact(createContact)
		.then((data) => {
			console.log('API called successfully. Returned data: ' + JSON.stringify(data));
		})
		.catch((err) => {
			console.log(err.message);
		});
}

export function sendSlackIncorrectConfigurationEmail(clientEmail) {
	const msg = {
		to: clientEmail,
		from: 'no-reply@mail.founderphone.com',
		subject: 'Your Slack is setup incorrectly for FounderPhone',
		text: "Hi there!\n\nWe noticed you tried to use FounderPhone, but your Slack doesn't allow FounderPhone to create channels. Ask your Slack admin to go to Administration > Workspace settings > Permissions > Channel Management and set people who can create private channels and public channels to Everyone. See this Slack help center article for more information: https://slack.com/help/articles/115004988303-Set-channel-management-preferences\n\nReach out if you have any questions. \n\nBest,\nYour friends at FounderPhone",
	};

	SendGridMail.send(msg, false, (err, result) => {
		if (err) {
			console.log('Error :' + err);
		} else {
			console.log('Email sent successfully');
		}
	});
}

export function sentSMSFailureEmail(clientEmail, fromNumber, message) {
	const msg = {
		to: clientEmail,
		from: 'no-reply@mail.founderphone.com',
		subject:
			"A customer messaged you but we couldn't send it to your Slack",
		text:
			'You received a message from ' +
			parsePhoneNumberFromString(fromNumber).formatNational() +
			": '" +
			message +
			"', but you haven't connected your Slack to FounderPhone. Please visit https://app.founderphone.com to setup your Slack and receive texts.\n\nBest,\nYour friends at FounderPhone",
	};

	SendGridMail.send(msg, false, (err, result) => {
		if (err) {
			console.log('Error :' + err);
		} else {
			console.log('Email sent successfully');
		}
	});
}

export function sendTrialPeriodEndReminder(clientEmail) {
	const msg = {
		to: clientEmail,
		replyTo: 'support@founderphone.com',
		from: 'no-reply@mail.founderphone.com',
		subject: 'Your FounderPhone trial is ending',
		text: "Hi there!\n\nWe hope you've had a great time trying FounderPhone. We just wanted to let you know that your trial is expiring in 2 days. Please visit https://app.founderphone.com and subscribe to continue using your number. If you're not interested in subscribing to a plan, we'd really appreciate any feedback. We build quickly and can address any issues you have asap. Reach out if you have any questions. \n\nBest,\nYour friends at FounderPhone",
	};

	SendGridMail.send(msg, false, (err, result) => {
		if (err) {
			console.log('Error :' + err);
		} else {
			console.log('Email sent successfully');
		}
	});
}

export function sendSMSInEmailForUnpaidClients(
	clientEmail,
	fromNumber,
	message
) {
	const msg = {
		to: clientEmail,
		from: 'no-reply@mail.founderphone.com',
		replyTo: 'support@founderphone.com',
		subject:
			'[IMPORTANT] Your customers are messaging you on FounderPhone!',
		text: `Hi there, \n\nYour customers are messaging you through FounderPhone:\n\n${parsePhoneNumberFromString(
			fromNumber
		).formatNational()} : "${message}".\n\nPlease visit https://app.founderphone.com to subscribe to a plan and respond to these messages from Slack. If you have any issues please contact support@founderphone.com.\n\nBest,\nYour friends at FounderPhone`,
	};

	SendGridMail.send(msg, false, (err, result) => {
		if (err) {
			console.log('Error :' + err);
		} else {
			console.log('Email sent successfully');
		}
	});
}
