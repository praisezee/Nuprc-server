import mongoose, { Schema, Document } from "mongoose";

export interface IBoardMember extends Document {
	name: string;
	position: string;
	image: string; // URL to image
	bio?: string;
	order: number;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const BoardMemberSchema: Schema = new Schema(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		position: {
			type: String,
			required: [true, "Position is required"],
			trim: true,
		},
		image: {
			type: String,
			required: [true, "Image URL is required"],
		},
		bio: {
			type: String,
			required: false,
		},
		order: {
			type: Number,
			default: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.model<IBoardMember>("BoardMember", BoardMemberSchema);
