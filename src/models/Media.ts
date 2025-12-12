import mongoose, { Schema, Document, Model } from "mongoose";

export enum MediaType {
	PHOTO = "photo",
	VIDEO = "video",
}

export interface IMedia extends Document {
	title: string;
	description?: string;
	type: MediaType;
	url: string;
	thumbnailUrl?: string;
	category?: string;
	album?: string;
	uploadedAt: Date;
	tags: string[];
	uploadedBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		description: {
			type: String,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		type: {
			type: String,
			enum: Object.values(MediaType),
			required: [true, "Media type is required"],
		},
		url: {
			type: String,
			required: [true, "URL is required"],
		},
		thumbnailUrl: {
			type: String,
		},
		category: {
			type: String,
			trim: true,
		},
		album: {
			type: String,
			trim: true,
		},
		uploadedAt: {
			type: Date,
			default: Date.now,
		},
		tags: {
			type: [String],
			default: [],
		},
		uploadedBy: {
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
mediaSchema.index({ type: 1, uploadedAt: -1 });
mediaSchema.index({ category: 1 });
mediaSchema.index({ album: 1 });
mediaSchema.index({ tags: 1 });
mediaSchema.index({ title: "text", description: "text" }); // Full-text search

const Media: Model<IMedia> = mongoose.model<IMedia>("Media", mediaSchema);

export default Media;
