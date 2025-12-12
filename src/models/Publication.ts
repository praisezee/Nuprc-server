import mongoose, { Schema, Document, Model } from "mongoose";

export enum PublicationCategory {
	ANNUAL_REPORTS = "Annual Reports",
	OPERATIONAL_REPORTS = "Operational Reports",
	PRODUCTION_STATUS = "Production Status",
	GAS_REPORTS = "Gas Reports",
	OIL_REPORTS = "Oil Reports",
	ACREAGE_REPORTS = "Acreage Reports",
	UPSTREAM_GAZE = "Upstream Gaze Magazine",
}

export interface IPublication extends Document {
	title: string;
	description: string;
	category: PublicationCategory;
	fileUrl: string;
	fileSize: number;
	fileType: string;
	publishYear: number;
	publishedAt: Date;
	downloadCount: number;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const publicationSchema = new Schema<IPublication>(
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
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		category: {
			type: String,
			enum: Object.values(PublicationCategory),
			required: [true, "Category is required"],
		},
		fileUrl: {
			type: String,
			required: [true, "File URL is required"],
		},
		fileSize: {
			type: Number,
			required: [true, "File size is required"],
		},
		fileType: {
			type: String,
			required: [true, "File type is required"],
			default: "application/pdf",
		},
		publishYear: {
			type: Number,
			required: [true, "Publish year is required"],
			min: [1960, "Publish year must be after 1960"],
			max: [new Date().getFullYear() + 1, "Publish year cannot be in the future"],
		},
		publishedAt: {
			type: Date,
			default: Date.now,
		},
		downloadCount: {
			type: Number,
			default: 0,
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
publicationSchema.index({ category: 1, publishYear: -1 });
publicationSchema.index({ publishedAt: -1 });
publicationSchema.index({ title: "text", description: "text" }); // Full-text search

const Publication: Model<IPublication> = mongoose.model<IPublication>(
	"Publication",
	publicationSchema
);

export default Publication;
