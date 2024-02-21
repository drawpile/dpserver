(()=>{(function(){let d={"dp:4.20.1":{text:"2.0",className:"version-outdated",title:"Drawpile 2.0 (not compatible with Drawpile 2.2)"},"dp:4.21.2":{text:"2.1",className:"version-compatible",title:"Drawpile 2.1 (compatible with Drawpile 2.2)"},"dp:4.24.0":{text:"2.2",className:"version-current",title:"Drawpile 2.2"}},f={text:"???",className:"version-unknown",title:"Unknown Version"},h=["dp:4.20.1","dp:4.21.2","dp:4.22.2","dp:4.23.0"],t=(s,o={},...l)=>{let i=document.createElement(s);return Object.entries(o).forEach(([e,r])=>{r instanceof Function?i.addEventListener(e,r):i.setAttribute(e,r)}),l.forEach(e=>{typeof e=="string"&&(e=document.createTextNode(e)),i.appendChild(e)}),i},a=(...s)=>t("td",{},...s),p=(s,o)=>t("div",{class:"root"},t("div",{class:"filters"},t("div",{class:"filter"},t("input",{type:"checkbox",id:"filter-password"}),t("label",{for:"filter-password"},"\u{1F512} Password")),t("div",{class:"filter"},t("input",{type:"checkbox",id:"filter-closed"}),t("label",{for:"filter-closed"},"\u{1F6AA} Closed (block new logins)")),t("div",{class:"filter"},t("input",{type:"checkbox",id:"filter-allowweb"}),t("label",{for:"filter-allowweb"},"\u{1F310} Can join via Web browser")),...o?[t("div",{class:"filter"},t("input",{type:"checkbox",id:"filter-nsfm"}),t("label",{for:"filter-nsfm"},"\u{1F51E} Not suitable for minors (NSFM)"))]:[]),t("div",{class:"listings"},t("table",{},t("colgroup",{},t("col",{width:"0%"}),t("col",{width:"100%"}),t("col",{width:"0%"}),t("col",{width:"0%"}),t("col",{width:"0%"}),t("col",{width:"0%"}),t("col",{width:"0%"})),t("thead",{},t("tr",{},t("th"),t("th",{class:"sortable sorted-desc","data-column":"title",click:s},"Title"),t("th",{class:"sortable","data-column":"host",click:s},"Server"),t("th",{class:"sortable","data-column":"owner",click:s},"Started by"),t("th",{class:"sortable","data-column":"users",click:s},"Users"),t("th",{class:"sortable","data-column":"activedrawingusers",click:s},"Active"),t("th",{class:"sortable","data-column":"started",click:s},"Uptime"),t("th",{class:"sortable","data-column":"protocol",click:s},"Version"),t("th"))),t("tbody",{},t("tr",{},t("td",{class:"loading",colspan:6},"Loading...")))))),u=s=>Number.isInteger(s)&&s>=0?`${s}`:"",b=(s,o)=>{let l=Date.parse(s),i=(o-l)/6e4,e=Math.floor(i/1440),r=Math.floor(i/60-e*24),n=Math.floor(i-e*1440-r*60);return e>0?`${e}d ${r}h ${n}m`:r>0?`${r}h ${n}m`:`${n}m`},m=s=>{let o=[];return s.password&&o.push(t("span",{title:"Password"},"\u{1F512}")),s.closed&&o.push(t("span",{title:"Closed (block new logins)"},"\u{1F6AA}")),s.nsfm&&o.push(t("span",{title:"Not suitable for minors (NSFM)"},"\u{1F51E}")),s.allowweb&&o.push(t("span",{title:"Can join via Web browser"},"\u{1F310}")),o},g=s=>{let o=d[s.protocol]||f;return t("span",{class:"flair "+o.className,title:o.title},o.text)},w=s=>{let o=s.port===27750?s.host:`${s.host}:${s.port}`,l=encodeURIComponent(o),i=encodeURIComponent(s.id),e=[];s.allowweb&&e.push("web"),s.nsfm&&e.push("nsfm");let r=e.length===0?"":`?${e.join("&")}`;return`https://drawpile.net/invites/${l}/${i}${r}`},v=(s,o,l)=>{let i={title:s,href:o,class:"btn",target:"_blank"};return l&&(i.disabled="true"),t("a",i,"Join")},x=(s,o)=>{let l=localStorage.getItem(s);return l===null?o:l==="1"},k=(s,o)=>{localStorage.setItem(s,o?"1":"")};class _ extends HTMLElement{constructor(){super(),this.attachShadow({mode:"open"}),this._sessions=[],this._sortColumn="title",this._sortDir=-1,this._filters={}}connectedCallback(){let o=this.getAttribute("list-url"),l=!!o.match(/[?&]nsfm=true\b/i),i=t("style",{},`
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
				content: "\u25BE "
			}
			.sorted-asc:before {
				position: absolute;
				margin-left: -1em;
				content: "\u25B4 "
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
		`);this.table=p(this.selectSortColumn.bind(this),l),this.shadowRoot.appendChild(i),this.shadowRoot.appendChild(this.table),this.connectFilter("password",!0),this.connectFilter("closed",!0),this.connectFilter("allowweb",!1),this.connectFilter("nsfm",!1),fetch(o).then(e=>e.json()).then(this.setSessions.bind(this)).catch(e=>{console.error(e),this.setError("Could not fetch session list")})}connectFilter(o,l){let i=this.table.querySelector(`#filter-${o}`);if(i){let e=`drawpile-sessionlist-filter-${o}`,r=x(e,l);this._filters[o]=r,i.checked=r,i.addEventListener("click",()=>{let n=i.checked;this._filters[o]=n,this.updateTable(),k(e,n)})}else this._filters[o]=!1}setError(o){let l=this.table.querySelector("tbody");l.innerHTML="",l.append(t("tr",{},t("td",{class:"error",colspan:6},o)))}selectSortColumn(o){let l=o.target,i=l.getAttribute("data-column");i===this._sortColumn?this._sortDir=-1*this._sortDir:this._sortColumn=i;let e=l.parentNode.firstChild;for(;e!==null;)e.classList.remove("sorted-desc","sorted-asc"),e=e.nextSibling;l.classList.add(this._sortDir>0?"sorted-asc":"sorted-desc"),this._sessions.length>0&&this.updateTable()}setSessions(o){for(let l of o)l.allowweb&&h.includes(l.protocol)&&(l.allowweb=!1);this._sessions=o,this.updateTable()}updateTable(){let o=this.table.querySelector("tbody");o.innerHTML="";let l=Date.now();if(this._sessions.length===0)o.append(t("tr",{class:"empty"},t("td",{colspan:7},"No active sessions at the moment")));else{let i=[...this._sessions].sort((e,r)=>{let n=e[this._sortColumn],c=r[this._sortColumn];return typeof n=="string"&&(n=n.trim().toLowerCase()),typeof c=="string"&&(c=c.trim().toLowerCase()),n<c?this._sortDir:n>c?-this._sortDir:0}).filter(e=>(this._filters.password||!e.password)&&(this._filters.closed||!e.closed)&&(!this._filters.allowweb||e.allowweb)&&(this._filters.nsfm||!e.nsfm)).map(e=>{let r=e.title||"(untitled)",n=w(e);return t("tr",{class:e.nsfm?"nsfw":""},t("td",{class:"column-flags"},...m(e)),t("td",{class:"column-title"},t("a",{href:n,title:r,target:"_blank"},r)),a(e.host),a(e.owner),a(""+e.users),a(u(e.activedrawingusers)),a(b(e.started,l)),t("td",{class:"column-version"},g(e)),a(v(`Join ${r} at ${e.host}`,n,e.closed)))});i.length===0?o.append(t("tr",{class:"empty"},t("td",{colspan:7},"All sessions have been filtered out"))):o.append(...i)}}}customElements.define("drawpile-session-list",_)})();})();
