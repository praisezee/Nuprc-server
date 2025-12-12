import mongoose, { Schema, Document, Model } from "mongoose";
import { ContentStatus } from "./News";

export enum RegulationCategory {
	PRE_PIA = "Pre P.I.A",
	PIA = "P.I.A",
	GAZZETTED = "Gazzetted Regulations",
	ACTS = "Acts",
	GUIDELINES = "Guidelines",
}

export interface IRegulation extends Document {
	title: string;
	description: string;
	category: RegulationCategory;
	fileUrl: string;
	fileSize?: number;
	fileType?: string;
	effectiveDate?: Date;
	status: ContentStatus;
	tags: string[];
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const regulationSchema = new Schema<IRegulation>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [300, "Title cannot exceed 300 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			maxlength: [2000, "Description cannot exceed 2000 characters"],
		},
		category: {
			type: String,
			enum: Object.values(RegulationCategory),
			required: [true, "Category is required"],
		},
		fileUrl: {
			type: String,
			required: [true, "File URL is required"],
		},
		fileSize: {
			type: Number,
		},
		fileType: {
			type: String,
			default: "application/pdf",
		},
		effectiveDate: {
			type: Date,
		},
		status: {
			type: String,
			enum: Object.values(ContentStatus),
			default: ContentStatus.PUBLISHED,
		},
		tags: {
			type: [String],
			default: [],
		},
		createdBy: {
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
regulationSchema.index({ category: 1, effectiveDate: -1 });
regulationSchema.index({ status: 1 });
regulationSchema.index({ tags: 1 });
regulationSchema.index({ title: "text", description: "text" }); // Full-text search

const Regulation: Model<IRegulation> = mongoose.model<IRegulation>(
	"Regulation",
	regulationSchema
);

export default Regulation;
