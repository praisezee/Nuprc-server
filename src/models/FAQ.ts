import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFAQ extends Document {
	question: string;
	answer: string;
	category: string;
	order: number;
	isPublished: boolean;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const faqSchema = new Schema<IFAQ>(
	{
		question: {
			type: String,
			required: [true, "Question is required"],
			trim: true,
			maxlength: [300, "Question cannot exceed 300 characters"],
		},
		answer: {
			type: String,
			required: [true, "Answer is required"],
			maxlength: [2000, "Answer cannot exceed 2000 characters"],
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		order: {
			type: Number,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			default: true,
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
faqSchema.index({ isPublished: 1, category: 1, order: 1 });
faqSchema.index({ question: "text", answer: "text" }); // Full-text search

const FAQ: Model<IFAQ> = mongoose.model<IFAQ>("FAQ", faqSchema);

export default FAQ;
