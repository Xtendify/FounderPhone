import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const MessageSchema = new mongoose.Schema({
	client: {
		type: Schema.Types.ObjectId,
		ref: 'Client',
		required: true,
	},
	fromPhoneMapping: {
		type: Schema.Types.ObjectId,
		ref: 'PhoneMapping',
		// required: true,
	},
	toPhoneMapping: {
		type: Schema.Types.ObjectId,
		ref: 'PhoneMapping',
	},
	isCall: {
		type: Schema.Types.Boolean,
		default: false,
	},
	message: {
		type: Schema.Types.String,
		default: '',
	},
	isClientReply: {
		type: Schema.Types.Boolean,
		default: false,
	},
	status: {
		type: Schema.Types.String,
		enum: [
			'init', // not from Twilio
			'accepted',
			'queued',
			'sending',
			'sent',
			'failed',
			'delivered',
			'undelivered',
			'receiving',
			'received',
			'read',
		],
		default: 'init',
	},
	campaign: {
		type: Schema.Types.ObjectId,
		ref: 'campaign',
		required: false,
	},
	createdOn: {
		type: Schema.Types.Date,
		default: Date.now(),
	},
});

const Message = mongoose.model('Message', MessageSchema);

export default Message;
