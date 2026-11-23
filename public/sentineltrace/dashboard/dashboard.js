'use strict';

const state = {
  alerts: [],
  copilot: [],
  evaluation: null,
  sshEvents: [],
  sourceFiles: {},
  filteredAlerts: [],
  filteredCopilot: [],
  filteredSsh: [],
  activeView: 'overview'
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const fmt = (value) => new Intl.NumberFormat('en-IN').format(Number(value) || 0);
const titleCase = (value) => String(value || '').toLowerCase().replace(/(^|[_\s-])\w/g, (m) => m.toUpperCase()).replaceAll('_',' ');

const DETECTIONS = [
  { id:'ST-DET-01', name:'Authentication burst → success', technique:'T1110.001', category:'Credential Access', detail:'Repeated SSH failures followed by a successful login. Validate source, account owner, MFA result and surrounding logon activity.' },
  { id:'ST-DET-02', name:'New local account creation', technique:'T1136.001', category:'Persistence', detail:'Windows Security Event ID 4720. Correlate actor, account group changes, logons and approved provisioning activity.' },
  { id:'ST-DET-03', name:'Encoded PowerShell execution', technique:'T1059.001', category:'Execution', detail:'Encoded PowerShell command line. Review parent process, script block logging, signer, hash and change context.' },
  { id:'ST-DET-04', name:'Suspicious scheduled task', technique:'T1053.005', category:'Persistence', detail:'Scheduled task creation. Inspect task XML, action path, arguments, trigger, run-as account and creator.' },
  { id:'ST-DET-05', name:'Unusual LSASS process access', technique:'T1003.001', category:'Credential Access', detail:'Sysmon Event ID 10 targeting lsass.exe. Review source process, signer, hash and approved security tooling context.' }
];

async function fetchText(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${path} returned ${response.status}`);
  return response.text();
}
async function fetchJson(path) { return JSON.parse(await fetchText(path)); }
function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i=0;i<text.length;i++) {
    const ch = text[i];
    if (ch === '"' && quoted && text[i+1] === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(cell); cell=''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && text[i+1] === '\n') i++;
      row.push(cell); if (row.some(v => v !== '')) rows.push(row); row=[]; cell='';
    } else cell += ch;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  const headers = (rows.shift() || []).map(x => x.trim());
  return rows.map(values => Object.fromEntries(headers.map((key,index)=>[key, values[index] ?? ''])));
}
function parseSshLog(text) {
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+sshd(?:\[\d+\])?:\s+(.*)$/);
    if (!match) continue;
    const msg = match[3];
    const failed = msg.match(/Failed password for (?:invalid user )?(\S+) from ([0-9a-fA-F:.]+)/);
    const success = msg.match(/Accepted (?:password|publickey) for (\S+) from ([0-9a-fA-F:.]+)/);
    const event = failed || success;
    if (!event) continue;
    entries.push({ timestamp:match[1], host:match[2], event_type:failed?'auth_failure':'auth_success', username:event[1], source_ip:event[2], raw:line.trim() });
  }
  return entries;
}
function normalizeAlert(a) {
  return {
    rule_id:a.rule_id || a.detection_id || 'UNKNOWN',
    severity:String(a.severity || 'UNKNOWN').toUpperCase(),
    host:a.host || a.dest || '—',
    user:a.user || a.username || '—',
    source:a.source || a.src_ip || a.source_ip || '—',
    event:a.event || a.title || a.summary || '—',
    status:a.status || a.analyst_status || 'NEEDS_VALIDATION',
    ...a
  };
}
function updateDataState(message, ready=true) {
  const el = $('#data-state'); el.classList.toggle('ready', ready); el.innerHTML = `<i></i>${escapeHtml(message)}`;
}
function toast(message) {
  const el = $('#toast'); el.textContent=message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove('show'),2600);
}

async function loadRepositoryData() {
  updateDataState('Loading repository data', false);
  const results = await Promise.allSettled([
    fetchJson('../outputs/illustrative-siem/sample_alerts.json'),
    fetchJson('../outputs/copilot_demo/suggestions.json'),
    fetchJson('../outputs/copilot_eval/evaluation.json'),
    fetchText('../data/sample_auth.log')
  ]);
  const errors=[];
  if (results[0].status==='fulfilled') {
    const payload=results[0].value; state.alerts=(Array.isArray(payload)?payload:(payload.alerts||[])).map(normalizeAlert); state.sourceFiles.alerts=true;
  } else { errors.push('SIEM alerts'); state.sourceFiles.alerts=false; }
  if (results[1].status==='fulfilled') { state.copilot=Array.isArray(results[1].value)?results[1].value:[]; state.sourceFiles.copilot=true; }
  else { errors.push('copilot suggestions'); state.sourceFiles.copilot=false; }
  if (results[2].status==='fulfilled') { state.evaluation=results[2].value; state.sourceFiles.evaluation=true; }
  else { errors.push('evaluation summary'); state.sourceFiles.evaluation=false; }
  if (results[3].status==='fulfilled') { state.sshEvents=parseSshLog(results[3].value); state.sourceFiles.ssh=true; }
  else { errors.push('SSH log'); state.sourceFiles.ssh=false; }
  renderAll();
  $('#last-refresh').textContent=`Updated ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  updateDataState(errors.length?`Partial data · missing ${errors.join(', ')}`:'Repository data loaded', !errors.length);
  if (errors.length) toast(`Some repository files could not be loaded: ${errors.join(', ')}`);
}

function renderAll() {
  $('#nav-alert-count').textContent=state.alerts.length;
  renderOverview(); renderAlerts(); renderCopilot(); renderSsh();
}
function renderOverview() {
  const severities=['CRITICAL','HIGH','MEDIUM','LOW'];
  const counts=Object.fromEntries(severities.map(s=>[s,state.alerts.filter(a=>a.severity===s).length]));
  $('#metric-alerts').textContent=fmt(state.alerts.length);
  $('#metric-critical').textContent=fmt(counts.CRITICAL);
  $('#metric-high').textContent=fmt(counts.HIGH);
  $('#metric-events').textContent=fmt(state.sshEvents.length);
  $('#donut-total').textContent=fmt(state.alerts.length);
  const colors={CRITICAL:'#ff7187',HIGH:'#ffc46d',MEDIUM:'#e9db78',LOW:'#54d7a1'};
  let offset=0; const total=state.alerts.length || 1;
  const stops=severities.map(s=>{const start=offset/total*100;offset+=counts[s];return `${colors[s]} ${start}% ${offset/total*100}%`;});
  $('#severity-donut').style.background=`conic-gradient(${stops.join(',')})`;
  $('#severity-legend').innerHTML=severities.map(s=>`<div class="legend-item"><i class="legend-dot" style="background:${colors[s]}"></i><span>${titleCase(s)}</span><strong>${counts[s]}</strong></div>`).join('');
  const evalData=state.evaluation||{}; const suggestions=state.copilot;
  const countsV={TRUE_POSITIVE:0,FALSE_POSITIVE:0,ESCALATE:0};
  suggestions.forEach(s=>{if(countsV[s.suggested_verdict]!==undefined)countsV[s.suggested_verdict]++;});
  $('#copilot-total').textContent=fmt(suggestions.length);
  $('#schema-valid').textContent=`${evalData.valid_schema_outputs ?? '—'}/${evalData.alerts ?? suggestions.length ?? '—'}`;
  $('#verdict-bars').innerHTML=[['TRUE_POSITIVE','True positive','tp'],['FALSE_POSITIVE','False positive','fp'],['ESCALATE','Escalate','esc']].map(([key,label,cls])=>{
    const count=countsV[key],pct=suggestions.length?count/suggestions.length*100:0;
    return `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div><span class="bar-value">${count}</span></div>`;
  }).join('');
  $('#fixture-note').textContent=`${evalData.fixture_matches ?? '—'} fixture matches of ${evalData.alerts ?? '—'} synthetic cases. Not an LLM accuracy metric.`;
  $('#rule-grid').innerHTML=DETECTIONS.map(d=>`<div class="rule-card"><div class="rule-code">${d.id}</div><div class="rule-name">${d.name}</div><div class="rule-meta"><strong>${d.technique}</strong> · ${d.category}</div></div>`).join('');
}
function renderAlerts() {
  const search=($('#alert-search')?.value||'').toLowerCase(); const severity=$('#severity-filter')?.value||'ALL'; const status=$('#status-filter')?.value||'ALL';
  const rows=state.alerts.filter(a=>{
    const hay=[a.rule_id,a.severity,a.host,a.user,a.source,a.event,a.status].join(' ').toLowerCase();
    return (!search||hay.includes(search))&&(severity==='ALL'||a.severity===severity)&&(status==='ALL'||a.status===status);
  }); state.filteredAlerts=rows;
  $('#alert-result-count').textContent=`${rows.length} records`;
  $('#alerts-table').innerHTML=rows.length?rows.map((a,i)=>`<tr data-alert-index="${state.alerts.indexOf(a)}"><td><span class="rule-id">${escapeHtml(a.rule_id)}</span><span class="row-title">${escapeHtml(a.event)}</span></td><td><span class="severity-badge ${a.severity.toLowerCase()}">${escapeHtml(a.severity)}</span></td><td>${escapeHtml(a.host)}</td><td>${escapeHtml(a.user)}</td><td><span class="mono">${escapeHtml(a.source)}</span></td><td><span class="status-badge ${a.status==='ESCALATE'?'escalate':''}">${escapeHtml(a.status)}</span></td><td><span class="view-row">↗</span></td></tr>`).join(''):`<tr><td colspan="7" class="empty-state">No alerts match the selected filters.</td></tr>`;
  $$('#alerts-table tr[data-alert-index]').forEach(tr=>tr.addEventListener('click',()=>openAlertDetail(state.alerts[Number(tr.dataset.alertIndex)])));
}
function renderCopilot() {
  const search=($('#copilot-search')?.value||'').toLowerCase(); const verdict=$('#verdict-filter')?.value||'ALL';
  const rows=state.copilot.filter(a=>[a.alert_id,a.suggested_verdict,a.summary,a.likely_cause,a.backend].join(' ').toLowerCase().includes(search)&&(verdict==='ALL'||a.suggested_verdict===verdict));
  state.filteredCopilot=rows;
  const ev=state.evaluation||{}; const avg=state.copilot.length?state.copilot.reduce((n,a)=>n+(Number(a.confidence)||0),0)/state.copilot.length:0;
  $('#cp-total').textContent=fmt(state.copilot.length); $('#cp-valid').textContent=ev.valid_schema_outputs??'—'; $('#cp-match').textContent=ev.fixture_matches??'—'; $('#cp-confidence').textContent=state.copilot.length?`${Math.round(avg*100)}%`:'—';
  $('#copilot-result-count').textContent=`${rows.length} cases`;
  $('#copilot-table').innerHTML=rows.length?rows.map((a)=>`<tr data-copilot-id="${escapeHtml(a.alert_id)}"><td><span class="rule-id">${escapeHtml(a.alert_id)}</span></td><td><span class="verdict-badge ${String(a.suggested_verdict||'').toLowerCase().replaceAll('_','-')}">${escapeHtml(a.suggested_verdict||'UNKNOWN')}</span></td><td><div class="confidence"><span class="confidence-track"><i style="width:${Math.max(0,Math.min(100,(Number(a.confidence)||0)*100))}%"></i></span><em>${Math.round((Number(a.confidence)||0)*100)}%</em></div></td><td><span class="row-title">${escapeHtml(a.summary||'No summary supplied')}</span></td><td><span class="mono">${escapeHtml(a.backend||'—')}</span></td><td><span class="status-badge">${a.human_review_required===false?'Not required':'Required'}</span></td><td><span class="view-row">↗</span></td></tr>`).join(''):`<tr><td colspan="7" class="empty-state">No copilot cases match the selected filters.</td></tr>`;
  $$('#copilot-table tr[data-copilot-id]').forEach(tr=>tr.addEventListener('click',()=>openCopilotDetail(state.copilot.find(a=>a.alert_id===tr.dataset.copilotId))));
}
function renderSsh() {
  const search=($('#ssh-search')?.value||'').toLowerCase();const type=$('#ssh-type-filter')?.value||'ALL';
  const rows=state.sshEvents.filter(e=>[e.timestamp,e.host,e.username,e.source_ip,e.raw,e.event_type].join(' ').toLowerCase().includes(search)&&(type==='ALL'||e.event_type===type)); state.filteredSsh=rows;
  const failures=state.sshEvents.filter(e=>e.event_type==='auth_failure').length;const successes=state.sshEvents.length-failures;const sources=new Set(state.sshEvents.map(e=>e.source_ip)).size;
  $('#ssh-total').textContent=fmt(state.sshEvents.length);$('#ssh-failures').textContent=fmt(failures);$('#ssh-successes').textContent=fmt(successes);$('#ssh-sources').textContent=fmt(sources);$('#ssh-result-count').textContent=`${rows.length} events`;
  $('#ssh-table').innerHTML=rows.length?rows.map(e=>`<tr><td class="mono">${escapeHtml(e.timestamp)}</td><td><span class="severity-badge ${e.event_type==='auth_failure'?'high':'low'}">${e.event_type==='auth_failure'?'FAILURE':'SUCCESS'}</span></td><td>${escapeHtml(e.host)}</td><td>${escapeHtml(e.username)}</td><td class="mono">${escapeHtml(e.source_ip)}</td><td title="${escapeHtml(e.raw)}">${escapeHtml(e.raw.length>100?e.raw.slice(0,100)+'…':e.raw)}</td></tr>`).join(''):`<tr><td colspan="6" class="empty-state">No SSH events match the selected filters. Check that data/sample_auth.log is present.</td></tr>`;
}
function openDrawer(html) { $('#drawer-content').innerHTML=html;$('#detail-drawer').classList.add('open');$('#detail-drawer').setAttribute('aria-hidden','false');$('#drawer-backdrop').classList.add('open'); }
function closeDrawer() { $('#detail-drawer').classList.remove('open');$('#detail-drawer').setAttribute('aria-hidden','true');$('#drawer-backdrop').classList.remove('open'); }
function openAlertDetail(a) {
  if(!a)return;const d=DETECTIONS.find(x=>x.id===a.rule_id)||{};
  const fields=[['Rule ID',a.rule_id],['Severity',a.severity],['Host',a.host],['User',a.user],['Source',a.source],['Analyst status',a.status],['ATT&CK',d.technique||'Review detection catalog'],['Category',d.category||'—']];
  openDrawer(`<div class="drawer-title">${escapeHtml(a.event)}</div><div class="drawer-sub">Illustrative SIEM alert · ${escapeHtml(a.rule_id)}</div><div class="detail-chips"><span class="severity-badge ${a.severity.toLowerCase()}">${escapeHtml(a.severity)}</span><span class="status-badge">${escapeHtml(a.status)}</span></div><section class="detail-section"><h3>Alert context</h3>${fields.map(([k,v])=>`<div class="detail-pair"><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>`).join('')}</section><section class="detail-section"><h3>Analyst validation focus</h3><p style="color:#b8c8d9;font-size:11px">${escapeHtml(d.detail||'Review the matching detection rule and correlate relevant telemetry.')}</p><ul class="detail-list"><li>Confirm event source, timestamp and field mappings.</li><li>Validate account, asset owner and expected administrative activity.</li><li>Search surrounding endpoint and authentication events.</li><li>Document evidence and escalate through approved procedures where warranted.</li></ul></section><section class="detail-section"><h3>Evidence label</h3><div class="evidence-block">Synthetic training record. This item is an illustrative SIEM output and was not exported from a connected Splunk or Sentinel workspace.</div></section>`);
}
function openCopilotDetail(a) {
  if(!a)return;const list=(items)=>Array.isArray(items)&&items.length?`<ul class="detail-list">${items.map(x=>`<li>${escapeHtml(typeof x==='string'?x:JSON.stringify(x))}</li>`).join('')}</ul>`:'<p style="color:#8298b1;font-size:11px">No items supplied.</p>';
  const iocs=(a.iocs||[]).map(i=>`${i.type}: ${i.value} (${i.source})`);
  openDrawer(`<div class="drawer-title">${escapeHtml(a.alert_id)}</div><div class="drawer-sub">Human-reviewed copilot suggestion · backend ${escapeHtml(a.backend||'unknown')}</div><div class="detail-chips"><span class="verdict-badge ${String(a.suggested_verdict||'').toLowerCase().replaceAll('_','-')}">${escapeHtml(a.suggested_verdict)}</span><span class="status-badge">Confidence ${Math.round((Number(a.confidence)||0)*100)}%</span></div><section class="detail-section"><h3>Suggested assessment</h3><p style="color:#d0deeb;font-size:12px">${escapeHtml(a.summary||'No summary')}</p><div class="detail-pair"><span>Likely cause</span><span>${escapeHtml(a.likely_cause||'Not supplied')}</span></div><div class="detail-pair"><span>Human review</span><span>${a.human_review_required===false?'Not required':'Required'}</span></div></section><section class="detail-section"><h3>Evidence supplied</h3>${list(a.evidence)}</section><section class="detail-section"><h3>Extracted indicators</h3>${list(iocs)}</section><section class="detail-section"><h3>Suggested next steps</h3>${list(a.next_steps)}</section><section class="detail-section"><h3>Questions for analyst</h3>${list(a.questions)}</section><section class="detail-section"><h3>Unknowns / limitations</h3>${list(a.unknowns)}</section><section class="detail-section"><div class="evidence-block">This is a mock-provider recommendation over synthetic input. Treat as a draft, independently verify every claim, and record a human disposition.</div></section>`);
}
function switchView(view) {
  state.activeView=view;
  $$('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));
  $$('.nav-item').forEach(el=>el.classList.toggle('active',el.dataset.view===view));
  const labels={overview:'Overview',alerts:'SIEM alerts',copilot:'Copilot review',ssh:'SSH telemetry'};$('#crumb-current').textContent=labels[view]||'Overview';
}
function exportCsv(rows,filename) {
  if(!rows.length){toast('No rows to export.');return;}
  const headers=Object.keys(rows[0]);const quote=v=>`"${String(v??'').replaceAll('"','""')}"`;
  const csv=[headers.map(quote).join(','),...rows.map(row=>headers.map(h=>quote(row[h])).join(','))].join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);toast('CSV export prepared.');
}

async function loadLocalFiles(files) {
  const list=Array.from(files);if(!list.length)return;
  for(const file of list){
    const text=await file.text();const name=file.name.toLowerCase();
    try {
      if(name.includes('sample_alerts')||name.includes('alert')&&name.endsWith('.csv')) {
        const data=name.endsWith('.csv')?parseCsv(text):JSON.parse(text);state.alerts=(Array.isArray(data)?data:(data.alerts||[])).map(normalizeAlert);state.sourceFiles.alerts=true;
      } else if(name.includes('suggestion')||name.includes('copilot')&&name.endsWith('.json')) {state.copilot=JSON.parse(text);if(!Array.isArray(state.copilot))throw new Error('Copilot JSON must contain an array');state.sourceFiles.copilot=true;}
      else if(name.includes('evaluation')||name.includes('summary')) {state.evaluation=JSON.parse(text);state.sourceFiles.evaluation=true;}
      else if(name.endsWith('.log')||name.includes('auth')) {state.sshEvents=parseSshLog(text);state.sourceFiles.ssh=true;}
      else {toast(`Skipped unrecognized file: ${file.name}`);}
    } catch(error) {toast(`Could not read ${file.name}: ${error.message}`);}
  }
  renderAll();updateDataState('Local file override loaded',true);$('#last-refresh').textContent='Using selected local files';toast('Dashboard updated from selected local files.');
}

function init() {
  $$('.nav-item').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.view)));
  $$('[data-go]').forEach(button=>button.addEventListener('click',()=>switchView(button.dataset.go)));
  $('#refresh-btn').addEventListener('click',loadRepositoryData);
  $('#data-upload').addEventListener('change',event=>loadLocalFiles(event.target.files));
  $('#close-drawer').addEventListener('click',closeDrawer);$('#drawer-backdrop').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')closeDrawer();});
  ['alert-search','severity-filter','status-filter'].forEach(id=>$('#'+id).addEventListener(id==='alert-search'?'input':'change',renderAlerts));
  ['copilot-search','verdict-filter'].forEach(id=>$('#'+id).addEventListener(id==='copilot-search'?'input':'change',renderCopilot));
  ['ssh-search','ssh-type-filter'].forEach(id=>$('#'+id).addEventListener(id==='ssh-search'?'input':'change',renderSsh));
  $('#export-alerts').addEventListener('click',()=>exportCsv(state.filteredAlerts,'sentineltrace-filtered-alerts.csv'));
  switchView('overview');loadRepositoryData();
}

document.addEventListener('DOMContentLoaded',init);
