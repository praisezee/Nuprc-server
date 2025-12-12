import mongoose, { Schema, Document, Model } from "mongoose";

export enum AuditAction {
	CREATE = "create",
	UPDATE = "update",
	DELETE = "delete",
	LOGIN = "login",
	LOGOUT = "logout",
	PUBLISH = "publish",
	UNPUBLISH = "unpublish",
}

export interface IAuditLog extends Document {
	user: mongoose.Types.ObjectId;
	action: AuditAction;
	resource: string;
	resourceId?: mongoose.Types.ObjectId;
	changes?: any;
	ipAddress?: string;
	userAgent?: string;
	timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		action: {
			type: String,
			enum: Object.values(AuditAction),
			required: true,
		},
		resource: {
			type: String,
			required: true,
		},
		resourceId: {
			type: Schema.Types.ObjectId,
		},
		changes: {
			type: Schema.Types.Mixed,
		},
		ipAddress: {
			type: String,
		},
		userAgent: {
			type: String,
		},
		timestamp: {
			type: Date,
			default: Date.now,
		},
	},
	{
		timestamps: false, // Using custom timestamp field
	}
);

// Create indexes
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>(
	"AuditLog",
	auditLogSchema
);

export default AuditLog;
