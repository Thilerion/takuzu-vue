import { isDevModeEnabledInLocalStorage } from "./dev-mode.js";

let errorEventHandlersSet = false;

export class ErrorHandler {
	constructor(alertErrors) {
		if (alertErrors == null) {
			this.alertErrors = !!isDevModeEnabledInLocalStorage;
		} else {
			this.alertErrors = alertErrors;
		}

		this.errorsCaught = [];
		this._initEventHandlers();
	}

	_initEventHandlers() {
		if (errorEventHandlersSet) {
			console.warn('Event handlers for errors already set.');
			return;
		}
		window.addEventListener('error', this.handleGlobalError);
		errorEventHandlersSet = true;
	}

	toggleAlertErrors(bool) {
		this.alertErrors = !!bool;
	}

	handleGlobalError(err) {
		this.handleError(err, 'window');
	}

	handleError(error, errorSource, additionalData) {
		console.warn(`Error registered from: ${errorSource}`);
		console.warn(error);
		if (additionalData) console.warn({ ...additionalData });

		this.errorsCaught.push({ error, source: errorSource, data: additionalData });

		if (this.alertErrors) {
			const msg = error?.message ?? error.toString();
			window.alert(`Error registered from: ${errorSource}\n${msg}`);
		}
	}
}