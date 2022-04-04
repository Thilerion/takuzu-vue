export function readJsonFile(file) {
	return new Promise((resolve, reject) => {
		try {
			const tempReader = new FileReader();
			tempReader.onload = (event) => {
				const result = event.target.result;
				const obj = JSON.parse(result);
				resolve(obj);
			}
			tempReader.readAsText(file);
		} catch (e) {
			console.error('Error while reading file as json: ' + e.message);
			reject(e);
		}
	})
}

export function writeObjToBlob(obj) {
	try {
		const str = JSON.stringify(obj, null, 2);
		return new Blob(
			[str],
			{ type: 'application/json' }
		);
	} catch (e) {
		console.error('Error while create blob from obj: ' + e.message);
		return null;
	}	
}