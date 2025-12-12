import mongoose, { Schema, Document, Model } from "mongoose";

export enum ContentStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
	ARCHIVED = "archived",
}

export interface INews extends Document {
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	featuredImage?: string;
	category: string;
	tags: string[];
	author: mongoose.Types.ObjectId;
	publishedAt?: Date;
	status: ContentStatus;
	views: number;
	createdAt: Date;
	updatedAt: Date;
}

const newsSchema = new Schema<INews>(
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
		excerpt: {
			type: String,
			required: [true, "Excerpt is required"],
			maxlength: [500, "Excerpt cannot exceed 500 characters"],
		},
		featuredImage: {
			type: String,
		},
		category: {
			type: String,
			required: [true, "Category is required"],
			trim: true,
		},
		tags: {
			type: [String],
			default: [],
		},
		author: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		publishedAt: {
			type: Date,
		},
		status: {
			type: String,
			enum: Object.values(ContentStatus),
			default: ContentStatus.DRAFT,
		},
		views: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	}
);

// Auto-generate slug from title if not provided
newsSchema.pre("validate", function (next) {
	if (!this.slug && this.title) {
		this.slug = this.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, "");
	}
	next();
});

// Set publishedAt when status changes to published
newsSchema.pre("save", function (next) {
	if (
		this.isModified("status") &&
		this.status === ContentStatus.PUBLISHED &&
		!this.publishedAt
	) {
		this.publishedAt = new Date();
	}
	next();
});

// Create indexes
newsSchema.index({ slug: 1 });
newsSchema.index({ status: 1, publishedAt: -1 });
newsSchema.index({ category: 1 });
newsSchema.index({ tags: 1 });
newsSchema.index({ title: "text", content: "text" }); // Full-text search

const News: Model<INews> = mongoose.model<INews>("News", newsSchema);

export default News;
