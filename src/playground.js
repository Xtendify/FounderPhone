require('dotenv').config();
import mongoose from 'mongoose';
import Twilio from 'twilio';
import readline from 'readline';

import Client from './models/client';
import { planTypes } from './utils/types';
import moment from 'moment';
import { addToSIB } from './controllers/mail';

const client = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_API_KEY);
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const whatsAppSendMessage = () => {
	client.messages
		.create({
			from: 'whatsapp:+14155238886',
			body: 'Your appointment is coming up on July 21 at 3PM',
			to: 'whatsapp:+919019029806',
		})
		.then((message) => console.log(message))
		.catch((error) => console.error(error));
};

const connectDB = () => {
	return (
		mongoose
			.connect(process.env.DATABASE_URL, {
				useUnifiedTopology: true,
				useNewUrlParser: true,
				useCreateIndex: true,
			})
			// .then(() => console.log('Mongo connected'))
			.catch((err) => {
				console.log(`DB Connection Error: ${err.message}`);
			})
	);
};

const disconnectDB = () => {
	return mongoose.disconnect();
};

const getReadlineAnswer = async (question) => {
	return await new Promise((resolve) => {
		rl.question(question, async (answer) => {
			resolve(answer);
		});
	});
};

const getActiveClients = async () => {
	await connectDB();

	const paidClients = await Client.find({
		'billingDetails.currentPlan': planTypes.PAID,
	});

	paidClients.forEach(async (c) => {
		const twilioNumber = await client.incomingPhoneNumbers.list({
			limit: 500,
			phoneNumber: c.twilioPhoneNumber,
		});

		console.log(twilioNumber);

		console.log({
			email: c.email,
			currentPlan: c.billingDetails.currentPlan,
			expirationDate: c.billingDetails.expirationDate,
			subscribedOn: c.billingDetails.subscribedOn,
			twilioPhoneNumber: c.twilioPhoneNumber,
		});
		const a = await getReadlineAnswer(
			`Do you want to disable subscription [y/N]? `
		);

		console.log(a);
	});

	rl.close();

	await disconnectDB();
};

const removeInactiveNumbers = async () => {
	await connectDB();

	console.log(`Fetching Twilio numbers in use...`);
	const twilioNumbers = await client.incomingPhoneNumbers.list({
		limit: 1000,
	});

	for await (const twilioNumber of twilioNumbers) {
		const client = await Client.findOne({
			twilioPhoneNumber: twilioNumber.phoneNumber,
		});

		if (!client) {
			console.log(
				`Client not found for ${twilioNumber.phoneNumber}, releasing the number...`
			);
			await removeNumber(twilioNumber);
		} else if (
			client.billingDetails.currentPlan === planTypes.TRIAL
			|| client.email.endsWith("@founderphone.com")
			|| client.email === "basiliskan@gmail.com"
		) {
			console.log(
				`Client found with email ${client.email} and status ${client.billingDetails.currentPlan} for ${twilioNumber.phoneNumber}, skipping.`
			);
		} else if (
			client.billingDetails.currentPlan === planTypes.NOT_PAID &&
			moment(client.billingDetails.subscribedOn).format() <
				moment().subtract(1, 'month').format()
		) {
			console.log(
				`Client found with email ${client.email} and status ${client.billingDetails} for ${twilioNumber.phoneNumber}, releasing the number...`
			);
			await removeNumber(twilioNumber);
			client.billingDetails.currentPlan = planTypes.NOT_PAID;
			client.twilioPhoneNumber = '';
			await client.save();
		} else {
			console.log(
				`Client found with email ${client.email} and status ${client.billingDetails} for ${twilioNumber.phoneNumber}`
			);
			const answer = await getReadlineAnswer(
				`Do you want to remove the number [y/N]? `
			);
			if (answer.toLowerCase() === 'y') {
				await removeNumber(twilioNumber);
				client.billingDetails.currentPlan = planTypes.NOT_PAID;
				client.twilioPhoneNumber = '';
				await client.save();
			}
		}
	}

	rl.close();

	await disconnectDB();
};

// removeInactiveNumbers();

const numbers = () => {
	client.incomingPhoneNumbers
		.list({ limit: 500 })
		.then((incomingPhoneNumbers) => {
			const notProdPhoneNumbers = incomingPhoneNumbers.filter(
				(i) => !i.voiceUrl.includes('app.founderphone.com')
			);
			const prodPhoneNumbers = incomingPhoneNumbers.filter((i) =>
				i.voiceUrl.includes('app.founderphone.com')
			);
			notProdPhoneNumbers.forEach((i) => {
				console.log(i);
			});
			console.log(notProdPhoneNumbers.length);
			console.log(prodPhoneNumbers.length);
		});
};

const removeNumber = async (i) => {
	console.log(`Removing ${i.phoneNumber}`);
	return client.incomingPhoneNumbers(i.sid).remove();
};

const updateURL = (i) => {
	client.incomingPhoneNumbers(i.sid).update({
		smsUrl: `https://app.founderphone.com/api/sms`,
		voiceUrl: `https://app.founderphone.com/api/forwardcall`,
	});
};


const syncInSIB = async () => {
	await connectDB();

	const clients = await Client.find();

	await disconnectDB();

	for await (const client of clients) {
		await addToSIB(client);
	}

	process.kill(process.pid, 'SIGTERM')
	process.exit(1)
};

syncInSIB();
