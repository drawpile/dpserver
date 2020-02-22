// MIT License
// 
// Copyright (c) 2019-2020 Calle Laakkonen
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
	'dp:4.20.1': '2.0',
	'dp:4.21.2': ' '
};

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

const listingTable = (setSortFunc) => el('div', {class: 'root'},
	el('table', {},
		el('thead', {},
			el('tr', {},
				el('th'),
				el('th', {class: 'sortable sorted-desc', 'data-column': 'title', click: setSortFunc}, "Title"),
				el('th', {class: 'sortable', 'data-column': 'host', click: setSortFunc}, "Server"),
				el('th', {class: 'sortable', 'data-column': 'owner', click: setSortFunc}, "Started by"),
				el('th', {class: 'sortable', 'data-column': 'users', click: setSortFunc}, "Users"),
				el('th', {class: 'sortable', 'data-column': 'started', click: setSortFunc}, "Uptime"),
			)
		),
		el('tbody', {},
			el('tr', {},
				el('td', {class: 'loading', colspan: 6}, 'Loading...')
			)
		)
	)
);

const uptime = (ts, now) => {
	const started = Date.parse(ts);
	const uptime = (now - started) / (1000*60);
	const hours = Math.floor(uptime / 60);
	const minutes = Math.floor(uptime - hours * 60);
	return `${hours}h ${minutes}m`;
}

const flair = (session) => {
	const flair = [];
	if(session.password) {
		flair.push('\u26bf');
	}
	const version = VERSION_FLAIR[session.protocol] || '???';
	if(version !== undefined && version !== ' ') {
		flair.push(el('span', {class: 'flair'}, version));
	}

	return flair;
}

class SessionList extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		this._sessions = [];
		this._sortColumn = 'title';
		this._sortDir = -1;
	}

	connectedCallback() {
		const url = this.getAttribute('list-url');

		const style = el('style', {}, `
			.root {
				background: #fcfcfc;
				color: #232629;
				border: 1px solid #ccc;
				border-radius: 5px;
				padding: 6px;
			}
			table {
				font-family: sans;
				width: 100%;
				border-collapse: collapse;
			}
			th {
				background: #4d4d4d;
				color: #fcfcfc;
				text-align: left;
			}
			th, td { padding: 6px; }
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
				text-shadow: none;
			}
			.nsfw a {
				color: transparent;
				text-shadow: 0 0 8px #da4453;
				transition: color 0.5s;
			}
			.nsfw:hover a {
				color: #da4453;
			}
			.flair {
				padding: 3px;
				border-radius: 3px;
				font-size: 0.8em;
				background: #8c44ad;
				color: #fcfcfc;
			}
			.sortable:hover {
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
		`);

		this.table = listingTable(this.selectSortColumn.bind(this));

		this.shadowRoot.appendChild(style);
		this.shadowRoot.appendChild(this.table);

		fetch(url)
			.then(result => result.json())
			.then(this.setSessions.bind(this))
			.catch(() => this.setError("Could not fetch session list"));
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
					el('td', {colspan: 6}, 'No active sessions at the moment')
				)
			);

		} else {
			const sessions = [...this._sessions].sort((a,b) => {
				if(a[this._sortColumn] < b[this._sortColumn]) {
					return this._sortDir;
				} else if(a[this._sortColumn] > b[this._sortColumn]) {
					return -this._sortDir;
				}
				return 0;
			});
			tbody.append(...sessions.map(s=> el('tr', {class: s.nsfm ? 'nsfw' : ''},
				td(...flair(s)),
				td(
					el('a', {
						href: `drawpile://${s.host}${s.port != 27750 ? ':' + s.port : ''}/${s.id}`
					}, s.title || '(untitled)')
				),
				td(s.host),
				td(s.owner),
				td(''+s.users),
				td(uptime(s.started, now))
			)));
		}
	}
}

customElements.define('drawpile-session-list', SessionList);

})();
