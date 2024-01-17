export function readJsonFile(file: Blob): Promise<unknown> {
	return new Promise((resolve, reject) => {
		try {
			const tempReader = new FileReader();
			tempReader.onload = (event) => {
				if (event.target == null) {
					throw new Error('FileReader onload event target is null.');
				}
				const result = event.target.result as null | string;
				if (result == null) {
					throw new Error('FileReader result is null.');
				}
				const obj: unknown = JSON.parse(result);
				resolve(obj);
			}
			tempReader.readAsText(file);
		} catch (e) {
			console.error('Error while reading file as json: ' + (e as Error).message);
			reject(e);
		}
	})
}

export function writeObjToBlob(obj: Record<PropertyKey, unknown>) {
	try {
		const str = JSON.stringify(obj, null, 2);
		return new Blob(
			[str],
			{ type: 'application/json' }
		);
	} catch (e) {
		console.error('Error while create blob from obj: ' + (e as Error).message);
		return null;
	}	
}