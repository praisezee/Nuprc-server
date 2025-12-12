export enum ContentStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
	ARCHIVED = "archived",
}

export interface INews {
	_id: string;
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	featuredImage?: string;
	category: string;
	tags: string[];
	author: string;
	publishedAt?: Date;
	status: ContentStatus;
	views: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface IPublication {
	_id: string;
	title: string;
	description: string;
	category: PublicationCategory;
	fileUrl: string;
	fileSize: number;
	fileType: string;
	publishYear: number;
	publishedAt: Date;
	downloadCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export enum PublicationCategory {
	ANNUAL_REPORTS = "Annual Reports",
	OPERATIONAL_REPORTS = "Operational Reports",
	PRODUCTION_STATUS = "Production Status",
	GAS_REPORTS = "Gas Reports",
	OIL_REPORTS = "Oil Reports",
	ACREAGE_REPORTS = "Acreage Reports",
	UPSTREAM_GAZE = "Upstream Gaze Magazine",
}

export enum RegulationCategory {
	PRE_PIA = "Pre P.I.A",
	PIA = "P.I.A",
	GAZZETTED = "Gazzetted Regulations",
	ACTS = "Acts",
}

export interface IRegulation {
	_id: string;
	title: string;
	description: string;
	category: RegulationCategory;
	fileUrl: string;
	effectiveDate?: Date;
	status: ContentStatus;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}

export enum MediaType {
	PHOTO = "photo",
	VIDEO = "video",
}

export interface IMedia {
	_id: string;
	title: string;
	description?: string;
	type: MediaType;
	url: string;
	thumbnailUrl?: string;
	category?: string;
	uploadedAt: Date;
	tags: string[];
	createdAt: Date;
	updatedAt: Date;
}
