import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
	SUPER_ADMIN = "super-admin",
	ADMIN = "admin",
	EDITOR = "editor",
	CONTENT_MANAGER = "content-manager",
}

export interface IUser extends Document {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	isActive: boolean;
	lastLogin?: Date;
	createdAt: Date;
	updatedAt: Date;
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
	{
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [8, "Password must be at least 8 characters long"],
			select: false, // Don't include password in queries by default
		},
		firstName: {
			type: String,
			required: [true, "First name is required"],
			trim: true,
		},
		lastName: {
			type: String,
			required: [true, "Last name is required"],
			trim: true,
		},
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.CONTENT_MANAGER,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLogin: {
			type: Date,
		},
	},
	{
		timestamps: true,
	}
);

// Hash password before saving
userSchema.pre("save", async function (this: IUser, next) {
	if (!this.isModified("password")) {
		return next();
	}

	try {
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error: any) {
		next(error);
	}
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (
	this: IUser,
	candidatePassword: string
): Promise<boolean> {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	} catch (error) {
		return false;
	}
};

// Create indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
