import { ContentStatus } from "../models/News";
import { MediaType } from "../models/Media";
import { PublicationCategory } from "../models/Publication";

export interface PaginationQuery {
	page?: string;
	limit?: string;
	search?: string;
}

export interface NewsQuery extends PaginationQuery {
	category?: string;
	tag?: string;
	status?: ContentStatus;
}

export interface MediaQuery extends PaginationQuery {
	type?: MediaType;
	category?: string;
	album?: string;
	tag?: string;
}

export interface PublicationQuery extends PaginationQuery {
	category?: PublicationCategory;
	year?: string;
}

export interface FAQQuery extends PaginationQuery {
	category?: string;
	search?: string;
}

export interface MongooseQueryFilter {
	[key: string]: any; // We still need some flexibility for Mongoose queries, but we can be more specific where possible
}
