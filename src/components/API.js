class API {
	constructor() {
		this.url = 'http://localhost:3005/data';
	}

	loadData() {
		return this._fetch();
	}

	addData(data) {
		const options = {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
			},
		};

		return this._fetch(options);
	}

	removeData(id) {
		const options = { method: 'DELETE' };
		return this._fetch(options, `/${id}`);
	}

	updateData(id, data) {
		const options = {
			method: 'PUT',
			body: JSON.stringify(data),
			headers: { 'Content-Type': 'application/json' },
		};
		return this._fetch(options, `/${id}`);
	}

	_fetch(options, additionalPath = '') {
		const url = this.url + additionalPath;

		return fetch(url, options).then((resp) => {
			if (resp.ok) {
				return resp.json();
			}
			return Promise.reject('Error: ' + resp.status);
		});
	}
}

export default API;
