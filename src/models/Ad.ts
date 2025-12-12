import mongoose, { Schema, Document, Model } from "mongoose";

export enum AdType {
	TEXT = "text",
	IMAGE = "image",
	VIDEO = "video",
	YOUTUBE = "youtube",
}

export enum AdStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
}

export interface IAd extends Document {
	title?: string;
	type: AdType;
	content: string;
	link?: string;
	colSpan: number;
	rowSpan: number;
	status: AdStatus;
	order: number;
	author: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const adSchema = new Schema<IAd>(
	{
		title: {
			type: String,
			trim: true,
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		type: {
			type: String,
			enum: Object.values(AdType),
			required: [true, "Ad type is required"],
		},
		content: {
			type: String,
			required: [true, "Content is required"],
		},
		link: {
			type: String,
			trim: true,
		},
		colSpan: {
			type: Number,
			default: 1,
			min: [1, "Column span must be at least 1"],
			max: [4, "Column span cannot exceed 4"],
		},
		rowSpan: {
			type: Number,
			default: 1,
			min: [1, "Row span must be at least 1"],
			max: [2, "Row span cannot exceed 2"],
		},
		status: {
			type: String,
			enum: Object.values(AdStatus),
			default: AdStatus.DRAFT,
		},
		order: {
			type: Number,
			default: 0,
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Create indexes
adSchema.index({ status: 1, order: 1 });
adSchema.index({ type: 1 });

const Ad: Model<IAd> = mongoose.model<IAd>("Ad", adSchema);

export default Ad;
