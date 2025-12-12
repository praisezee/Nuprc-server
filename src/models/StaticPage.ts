import mongoose, { Schema, Document, Model } from "mongoose";

export interface IContentSection {
	type: "text" | "image" | "video" | "list" | "table";
	heading?: string;
	content: string;
	order: number;
}

export interface IStaticPage extends Document {
	title: string;
	slug: string;
	content: string;
	sections: IContentSection[];
	metaTitle?: string;
	metaDescription?: string;
	template?: string;
	order: number;
	isPublished: boolean;
	lastEditedBy: mongoose.Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const contentSectionSchema = new Schema<IContentSection>({
	type: {
		type: String,
		enum: ["text", "image", "video", "list", "table"],
		required: true,
	},
	heading: String,
	content: {
		type: String,
		required: true,
	},
	order: {
		type: Number,
		required: true,
	},
});

const staticPageSchema = new Schema<IStaticPage>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: [200, "Title cannot exceed 200 characters"],
		},
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		content: {
			type: String,
			required: [true, "Content is required"],
		},
		sections: {
			type: [contentSectionSchema],
			default: [],
		},
		metaTitle: {
			type: String,
			maxlength: [60, "Meta title cannot exceed 60 characters"],
		},
		metaDescription: {
			type: String,
			maxlength: [160, "Meta description cannot exceed 160 characters"],
		},
		template: {
			type: String,
			default: "default",
		},
		order: {
			type: Number,
			default: 0,
		},
		isPublished: {
			type: Boolean,
			default: true,
		},
		lastEditedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

// Auto-generate slug from title if not provided
staticPageSchema.pre("save", function (next) {
	if (!this.slug && this.title) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
	next();
});

// Create indexes
staticPageSchema.index({ slug: 1 });
staticPageSchema.index({ isPublished: 1, order: 1 });

const StaticPage: Model<IStaticPage> = mongoose.model<IStaticPage>(
	"StaticPage",
	staticPageSchema
);

export default StaticPage;
