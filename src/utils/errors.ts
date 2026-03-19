export class MetabaseError extends Error {
	constructor(
		message: string,
		public statusCode?: number,
	) {
		super(message);
		this.name = "MetabaseError";
	}
}

export class AuthenticationError extends MetabaseError {
	constructor(message = "Authentication failed") {
		super(message, 401);
		this.name = "AuthenticationError";
	}
}

export class ForbiddenError extends MetabaseError {
	constructor(message = "Insufficient permissions") {
		super(message, 403);
		this.name = "ForbiddenError";
	}
}

export class NotFoundError extends MetabaseError {
	constructor(message = "Resource not found") {
		super(message, 404);
		this.name = "NotFoundError";
	}
}

export class RateLimitError extends MetabaseError {
	constructor(message = "Rate limit exceeded") {
		super(message, 429);
		this.name = "RateLimitError";
	}
}

export class ReadOnlyError extends MetabaseError {
	constructor(message = "Write operations are disabled (METABASE_READ_ONLY=true)") {
		super(message);
		this.name = "ReadOnlyError";
	}
}
