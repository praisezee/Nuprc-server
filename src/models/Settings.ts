import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialMedia {
	platform: string;
	url: string;
}

export interface IQuickLink {
	title: string;
	url: string;
	order: number;
}

export interface ISettings extends Document {
	siteName: string;
	siteDescription: string;
	contactEmail: string;
	contactPhone: string;
	address: string;
	socialMedia: ISocialMedia[];
	footerLinks: IQuickLink[];
	quickLinks: IQuickLink[];
	logo?: string;
	favicon?: string;
	officeHours?: string;
	lastUpdatedBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const socialMediaSchema = new Schema<ISocialMedia>({
	platform: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
});

const quickLinkSchema = new Schema<IQuickLink>({
	title: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	order: {
		type: Number,
		default: 0,
	},
});

const settingsSchema = new Schema<ISettings>(
	{
		siteName: {
			type: String,
			required: [true, "Site name is required"],
			default: "Nigerian Upstream Petroleum Regulatory Commission",
		},
		siteDescription: {
			type: String,
			required: [true, "Site description is required"],
			maxlength: [500, "Site description cannot exceed 500 characters"],
		},
		contactEmail: {
			type: String,
			required: [true, "Contact email is required"],
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		contactPhone: {
			type: String,
			required: [true, "Contact phone is required"],
		},
		address: {
			type: String,
			required: [true, "Address is required"],
		},
		socialMedia: {
			type: [socialMediaSchema],
			default: [],
		},
		footerLinks: {
			type: [quickLinkSchema],
			default: [],
		},
		quickLinks: {
			type: [quickLinkSchema],
			default: [],
		},
		logo: {
			type: String,
		},
		favicon: {
			type: String,
		},
		officeHours: {
			type: String,
		},
		lastUpdatedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Settings: Model<ISettings> = mongoose.model<ISettings>(
	"Settings",
	settingsSchema
);

export default Settings;
