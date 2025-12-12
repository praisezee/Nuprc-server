import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContactSubmission extends Document {
	name: string;
	email: string;
	subject: string;
	message: string;
	status: "new" | "read" | "replied";
	ipAddress?: string;
	createdAt: Date;
	updatedAt: Date;
}

const contactSubmissionSchema = new Schema<IContactSubmission>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		subject: {
			type: String,
			required: [true, "Subject is required"],
			trim: true,
			maxlength: [200, "Subject cannot exceed 200 characters"],
		},
		message: {
			type: String,
			required: [true, "Message is required"],
			maxlength: [5000, "Message cannot exceed 5000 characters"],
		},
		status: {
			type: String,
			enum: ["new", "read", "replied"],
			default: "new",
		},
		ipAddress: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

// Indexes
contactSubmissionSchema.index({ email: 1 });
contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ createdAt: -1 });

const ContactSubmission: Model<IContactSubmission> =
	mongoose.model<IContactSubmission>(
		"ContactSubmission",
		contactSubmissionSchema
	);

export default ContactSubmission;
