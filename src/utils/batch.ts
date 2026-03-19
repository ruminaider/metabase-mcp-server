/**
 * Execute async operations in batches with concurrency control.
 */
export async function batchProcess<T, R>(
	items: T[],
	fn: (item: T) => Promise<R>,
	concurrency = 5,
): Promise<Array<{ item: T; result?: R; error?: string }>> {
	const results: Array<{ item: T; result?: R; error?: string }> = [];

	for (let i = 0; i < items.length; i += concurrency) {
		const batch = items.slice(i, i + concurrency);
		const batchResults = await Promise.allSettled(batch.map(fn));

		for (let j = 0; j < batch.length; j++) {
			const outcome = batchResults[j];
			if (outcome.status === "fulfilled") {
				results.push({ item: batch[j], result: outcome.value });
			} else {
				results.push({ item: batch[j], error: (outcome.reason as Error).message });
			}
		}
	}

	return results;
}
