// MIT License
//
// Copyright (c) 2019-2020 Calle Laakkonen, 2023 askmeaboutloom
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
(function() {

const VERSION_FLAIR = {
	'dp:4.20.1': {
		text: '2.0',
		className: 'version-outdated',
		title: 'Drawpile 2.0 (not compatible with Drawpile 2.2)',
	},
	'dp:4.21.2': {
		text: '2.1',
		className: 'version-compatible',
		title: 'Drawpile 2.1 (compatible with Drawpile 2.2)',
	},
	'dp:4.24.0': {
		text: '2.2',
		className: 'version-current',
		title: 'Drawpile 2.2',
	},
};

const UNKNOWN_VERSION = {
	text: '???',
	className: 'version-unknown',
	title: 'Unknown Version',
};

const BLOCK_WEB_VERSIONS = ['dp:4.20.1', 'dp:4.21.2', 'dp:4.22.2', 'dp:4.23.0'];

const el = (name, attrs={}, ...children) => {
	const element = document.createElement(name);

	Object.entries(attrs).forEach(([key, value]) => {
		if(value instanceof Function) {
			element.addEventListener(key, value);
		} else {
			element.setAttribute(key, value);
		}
	});

	children.forEach(c => {
		if(typeof(c) === 'string') {
			c = document.createTextNode(c);
		}
		element.appendChild(c);
	});

	return element;
}

const td = (...children) => el('td', {}, ...children);

const listingTable = (setSortFunc, enableNsfm) => el('div', {class: 'root'},
	el('div', {class: 'filters'},
		el('div', {class: 'filter'},
			el('input', {type: 'checkbox', id: 'filter-password'}),
			el('label', {'for': 'filter-password'}, '🔒 Password')
		),
		el('div', {class: 'filter'},
			el('input', {type: 'checkbox', id: 'filter-closed'}),
			el('label', {'for': 'filter-closed'}, '🚪 Closed (block new logins)')
		),
		el('div', {class: 'filter'},
			el('input', {type: 'checkbox', id: 'filter-allowweb'}),
			el('label', {'for': 'filter-allowweb'}, '🌐 Can join via Web browser')
		),
		...(enableNsfm ? [
			el('div', {class: 'filter'},
				el('input', {type: 'checkbox', id: 'filter-nsfm'}),
				el('label', {'for': 'filter-nsfm'}, '🔞 Not suitable for minors (NSFM)')
			),
			] : [])
	),
	el('div', {class: 'listings'},
		el('table', {},
			el('colgroup', {},
				el('col', {width: '0%'}),
				el('col', {width: '100%'}),
				el('col', {width: '0%'}),
				el('col', {width: '0%'}),
				el('col', {width: '0%'}),
				el('col', {width: '0%'}),
				el('col', {width: '0%'})
			),
			el('thead', {},
				el('tr', {},
					el('th'),
					el('th', {class: 'sortable sorted-desc', 'data-column': 'title', click: setSortFunc}, "Title"),
					el('th', {class: 'sortable', 'data-column': 'host', click: setSortFunc}, "Server"),
					el('th', {class: 'sortable', 'data-column': 'owner', click: setSortFunc}, "Started by"),
					el('th', {class: 'sortable', 'data-column': 'users', click: setSortFunc}, "Users"),
					el('th', {class: 'sortable', 'data-column': 'activedrawingusers', click: setSortFunc}, "Active"),
					el('th', {class: 'sortable', 'data-column': 'started', click: setSortFunc}, "Uptime"),
					el('th', {class: 'sortable', 'data-column': 'protocol', click: setSortFunc}, "Version"),
					el('th'),
				)
			),
			el('tbody', {},
				el('tr', {},
					el('td', {class: 'loading', colspan: 6}, 'Loading...')
				)
			)
		)
	)
);

const activeDrawingUsers = (n) => {
	return Number.isInteger(n) && n >= 0 ? `${n}` : '';
};

const uptime = (ts, now) => {
	const started = Date.parse(ts);
	const uptime = (now - started) / 60000;
	const days = Math.floor(uptime / 1440);
	const hours = Math.floor(uptime / 60 - days * 24);
	const minutes = Math.floor(uptime - days * 1440 - hours * 60);
	if(days > 0) {
		return `${days}d ${hours}h ${minutes}m`;
	} else if(hours > 0) {
		return `${hours}h ${minutes}m`;
	} else {
		return `${minutes}m`;
	}
}

const flags = (session) => {
	const opts = [];
	if(session.password) {
		opts.push(el('span', {title: 'Password'}, '🔒'));
	}
	if(session.closed) {
		opts.push(el('span', {title: 'Closed (block new logins)'}, '🚪'));
	}
	if(session.nsfm) {
		opts.push(el('span', {title: 'Not suitable for minors (NSFM)'}, '🔞'));
	}
	if(session.allowweb) {
		opts.push(el('span', {title: 'Can join via Web browser'}, '🌐'));
	}
	return opts;
}

const versionFlair = (session) => {
	const version = VERSION_FLAIR[session.protocol] || UNKNOWN_VERSION;
	return el('span', {class: 'flair ' + version.className, title: version.title}, version.text);
};

const buildInviteLink = (session) => {
	const host = session.port === 27750 ? session.host : `${session.host}:${session.port}`;
	const encodedHost = encodeURIComponent(host);
	const encodedId = encodeURIComponent(session.id);
	const params = [];
	if(session.allowweb)  {
		params.push('web');
	}
	if(session.nsfm) {
		params.push('nsfm');
	}
	const suffix = params.length === 0 ? '' : `?${params.join('&')}`;
	return `https://drawpile.net/invites/${encodedHost}/${encodedId}${suffix}`;
}

const joinButton = (title, href, closed) => {
	const attributes = {title, href, class: 'btn', target: '_blank'};
	if(closed) {
		attributes.disabled = 'true';
	}
	return el('a', attributes, 'Join');
};

const getFilterFromLocalStorage = (localStorageKey, defaultValue) => {
	const value = localStorage.getItem(localStorageKey);
	return value === null ? defaultValue : value === '1';
};

const setFilterInLocalStorage = (localStorageKey, value) => {
	localStorage.setItem(localStorageKey, value ? '1' : '');
};

class SessionList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this._sessions = [];
		this._sortColumn = 'title';
		this._sortDir = -1;
		this._filters = {};
	}

	connectedCallback() {
		const url = this.getAttribute('list-url');
		const enableNsfm = !!url.match(/[?&]nsfm=true\b/i);

		const style = el('style', {}, `
			.root {
				background: #fcfcfc;
				color: #232629;
				border: 1px solid #ccc;
				border-radius: 5px;
				padding: 6px;
			}
			.listings {
				display: block;
				overflow-x: auto;
			}
			table {
				font-family: sans;
				width: 100%;
				border-collapse: collapse;
				white-space: nowrap;
			}
			th {
				background: #4d4d4d;
				color: #fcfcfc;
				text-align: left;
			}
			th, td {
				padding-top: 0.5em;
				padding-bottom: 0.5em;
				padding-left: 1em;
				padding-right: 1em;
			}
			tbody>tr:nth-child(even) { background: #eff0f1; }
			tr.empty>td { text-align: center }
			.loading, .error { text-align: center }
			.error { color: #ed1515; }
			a {
				color: #2980b9;
				text-decoration: none;
			}
			a:hover {
				text-decoration: underline;
			}
			.btn {
				background-color: #3298dc;
				border-color: transparent;
				border-radius: 4px;
				color: #fcfcfc;
				cursor: pointer;
				font-size: large;
				font-weight: bold;
				padding-bottom: 0.25em;
				padding-left: 1em;
				padding-right: 1em;
				padding-top: 0.25em;
			}
			.btn[disabled] {
				pointer-events: none;
				opacity: 0.5;
			}
			.btn:hover {
				background-color: #276cda;
				text-decoration: none;
			}
			.btn:active {
				background-color: #2366d1;
				text-decoration: none;
			}
			.nsfw .column-title a {
				color: #f14668;
			}
			.nsfw .btn {
				background-color: #f14668;
			}
			.nsfw .btn:hover {
				background-color: #f03a5f;
			}
			.nsfw .btn:active {
				background-color: #ef2e55;
			}
			.flair {
				padding-top: 3px;
				padding-bottom: 3px;
				padding-left: 5px;
				padding-right: 5px;
				border-radius: 3px;
				font-size: 0.8em;
				font-weight: bold;
			}
			.version-unknown {
				background: #8c44ad;
				color: #fcfcfc;
			}
			.version-outdated {
				background: #da4453;
				color: #fcfcfc;
			}
			.version-compatible {
				background: #4a4a4a;
				color: #fcfcfc;
			}
			.version-current {
				background: #2980b9;
				color: #fcfcfc;
			}
			.sortable:hover {
				cursor: pointer;
				text-decoration: underline;
			}
			.sorted-desc:before {
				position: absolute;
				margin-left: -1em;
				content: "\u25be "
			}
			.sorted-asc:before {
				position: absolute;
				margin-left: -1em;
				content: "\u25b4 "
			}
			.column-title {
				text-overflow:ellipsis;
				overflow: hidden;
				max-width: 10em;
			}
			.column-flags {
				text-align: center;
			}
			.column-flags > *, .column-version > * {
				cursor: help;
			}
			.filters {
				display: flex;
				margin-bottom: 0.5em;
			}
			.filter {
				margin-right: 1em;
			}
		`);

		this.table = listingTable(this.selectSortColumn.bind(this), enableNsfm);
		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(this.table);

		this.connectFilter('password', true);
		this.connectFilter('closed', true);
		this.connectFilter('allowweb', false);
		this.connectFilter('nsfm', false);

		fetch(url)
			.then(result => result.json())
			.then(this.setSessions.bind(this))
			.catch(e => {
				console.error(e);
				this.setError("Could not fetch session list");
			});
	}

	connectFilter(key, defaultValue) {
		const filter = this.table.querySelector(`#filter-${key}`);
		if(filter) {
			const localStorageKey = `drawpile-sessionlist-filter-${key}`;
			const initialValue = getFilterFromLocalStorage(localStorageKey, defaultValue);
			this._filters[key] = initialValue;
			filter.checked = initialValue;
			filter.addEventListener('click', () => {
				const value = filter.checked;
				this._filters[key] = value;
				this.updateTable();
				setFilterInLocalStorage(localStorageKey, value);
			});
		} else {
			this._filters[key] = false;
		}
	}

	setError(message) {
		const tbody = this.table.querySelector("tbody");
		tbody.innerHTML = '';
		tbody.append(
			el('tr', {},
				el('td', {class: 'error', colspan: 6}, message)
			)
		);

	}

	selectSortColumn(e) {
		const col = e.target;
		const field = col.getAttribute("data-column");
		if(field === this._sortColumn) {
			this._sortDir = -1 * this._sortDir;
		} else {
			this._sortColumn = field;
		}
		let sib = col.parentNode.firstChild;
		while(sib !== null) {
			sib.classList.remove("sorted-desc", "sorted-asc");
			sib = sib.nextSibling;
		}
		col.classList.add(this._sortDir > 0 ? "sorted-asc" : "sorted-desc");

		if(this._sessions.length > 0) {
			this.updateTable();
		}
	}

	setSessions(sessions) {
		for(const session of sessions) {
			if(session.allowweb && BLOCK_WEB_VERSIONS.includes(session.protocol)) {
				session.allowweb = false;
			}
		}
		this._sessions = sessions;
		this.updateTable();
	}

	updateTable() {
		const tbody = this.table.querySelector("tbody");
		tbody.innerHTML = '';

		const now = Date.now();

		if(this._sessions.length === 0) {
			tbody.append(
				el('tr', {class: 'empty'},
					el('td', {colspan: 7}, 'No active sessions at the moment')
				)
			);

		} else {
			const sessions = [...this._sessions]
				.sort((a,b) => {
					let va = a[this._sortColumn];
					let vb = b[this._sortColumn];
					if(typeof(va) === 'string') {
						va = va.trim().toLowerCase();
					}
					if(typeof(vb) === 'string') {
						vb = vb.trim().toLowerCase();
					}
					if(va < vb) {
						return this._sortDir;
					} else if(va > vb) {
						return -this._sortDir;
					}
					return 0;
				})
				.filter(s => {
					return (this._filters.password || !s.password)
						&& (this._filters.closed || !s.closed)
						&& (!this._filters.allowweb || s.allowweb)
						&& (this._filters.nsfm || !s.nsfm);
				})
				.map(s => {
					const title = s.title || '(untitled)';
					const href = buildInviteLink(s);
					return el('tr', {class: s.nsfm ? 'nsfw' : ''},
						el('td', {class: 'column-flags'}, ...flags(s)),
						el(
							'td',
							{class: 'column-title'},
							el('a', {href, title, target: "_blank"}, title)
						),
						td(s.host),
						td(s.owner),
						td(''+s.users),
						td(activeDrawingUsers(s.activedrawingusers)),
						td(uptime(s.started, now)),
						el('td', {class: 'column-version'}, versionFlair(s)),
						td(joinButton(`Join ${title} at ${s.host}`, href, s.closed))
					);
				});
			if(sessions.length === 0) {
				tbody.append(
					el('tr', {class: 'empty'},
						el('td', {colspan: 7}, 'All sessions have been filtered out')
					)
				);
			} else {
				tbody.append(...sessions);
			}
		}
	}
}

customElements.define('drawpile-session-list', SessionList);

})();
