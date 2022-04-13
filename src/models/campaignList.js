import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const campaignListSchema = new mongoose.Schema(
	{
		client: {
			type: Schema.Types.ObjectId,
			ref: 'Client',
			required: true,
		},
		title: {
			type: Schema.Types.String,
			require: true,
		},
		status: {
			type: Schema.Types.String,
			enum: ['SENT', 'SCHEDULED', 'FAILED'],
			default: 'SCHEDULED',
		},
		scheduleAt: {
			type: Schema.Types.Number,
			default: new Date().getTime(),
			min: new Date(),
		},
		phoneNumbers: { type: [Schema.Types.String] },
	},
	{ timestamps: true }
);

const Campaign = mongoose.model('campaign', campaignListSchema);

export default Campaign;
