const isSupported = () => ('wakeLock' in navigator);

// TODO: set timeout  

class WakeLock {
	constructor(onChange = () => {}) {
		this._enabled = false;
		this.isSupported = false;
		this.onChange = onChange;
		this.removeVisListener = null;

		if (isSupported()) {
			this.isSupported = true;
			this._wakeLockRef = null;

			const visibilityChangeHandler = () => {
				if (this._wakeLockRef != null && document.visibilityState === 'visible') {
					this.enable();
				}
			}

			document.addEventListener('visibilitychange', visibilityChangeHandler);
			this.removeVisListener = () => {
				document.removeEventListener('visibilitychange', visibilityChangeHandler);
			}
		}
	}

	destroy() {
		if (this.enabled) {
			this.disable();
			this.removeVisListener();
		}
	}

	get enabled() {
		return this._enabled;
	}
	set enabled(value) {
		this._enabled = value;
		this.onChange(value);
	}

	enable() {
		if (!this.isSupported) {
			console.warn('Wake lock not supported; cannot enable.');
			return;
		}
		return navigator.wakeLock
			.request('screen')
			.then(wakeLock => {
				this._wakeLockRef = wakeLock;
				this.enabled = true;
				console.log('Wake Lock active.');
				this._wakeLockRef.addEventListener('release', () => {
					console.log('Wake Lock released.');
					this.enabled = false;
				})
			})
			.catch(err => {
				this.enabled = false;
				console.warn('Error while trying to enable wake lock.');
				console.error(err);
			});
	}

	disable() {
		if (this._wakeLockRef) {
			this._wakeLockRef.release();
		}
		this._wakeLockRef = null;
		this.enabled = false;
	}
}

export default WakeLock;