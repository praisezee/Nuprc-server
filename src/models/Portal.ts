import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPortal extends Document {
	name: string;
	description: string;
	url: string;
	icon?: string;
	category: string;
	isExternal: boolean;
	requiresAuth: boolean;
	order: number;
	isActive: boolean;
	createdBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const portalSchema = new Schema<IPortal>(
	{
		name: {
			type: String,
			required: [true, "Portal name is required"],
			trim: true,
			maxlength: [100, "Portal name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		url: {
			type: String,
			required: [true, "URL is required"],
			trim: true,
		},
		icon: {
			type: String,
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		isExternal: {
			type: Boolean,
			default: true,
		},
		requiresAuth: {
			type: Boolean,
			default: false,
		},
		order: {
			type: Number,
			default: 0,
		},
		isActive: {
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
portalSchema.index({ isActive: 1, order: 1 });
portalSchema.index({ category: 1 });

const Portal: Model<IPortal> = mongoose.model<IPortal>("Portal", portalSchema);

export default Portal;
