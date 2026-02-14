import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  API_ENDPOINTS, API_BASE_URL, API_VERSION,
  CATEGORY_LABELS, CATEGORY_ORDER,
  ApiEndpoint, ApiParameter,
} from './api-docs.config';

interface TryItState {
  loading: boolean;
  response: string;
  statusCode: number;
  responseTime: number;
  error: boolean;
}

@Component({
  selector: 'app-api-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-docs">
      <header class="top-bar">
        <div class="top-bar-inner">
          <div class="brand">
            <span class="logo">⚡</span>
            <span class="title">Sport Aggregator API</span>
            <span class="version">{{ apiVersion }}</span>
          </div>
          <div class="top-info">
            <span class="base-url">{{ baseUrl }}</span>
          </div>
        </div>
      </header>

      <div class="layout">
        <aside class="sidebar">
          <div class="search-box">
            <input type="text" placeholder="Search endpoints..."
              [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" class="search-input" />
          </div>
          <nav class="nav">
            @for (cat of categories; track cat) {
              <div class="nav-category">
                <div class="nav-category-label">{{ categoryLabels[cat] }}</div>
                @for (ep of getEndpointsByCategory(cat); track ep.id) {
                  <button class="nav-item" [class.active]="activeEndpoint() === ep.id" (click)="scrollToEndpoint(ep.id)">
                    <span class="method-badge" [class]="ep.method.toLowerCase()">{{ ep.method }}</span>
                    <span class="nav-path">{{ ep.summary }}</span>
                  </button>
                }
              </div>
            }
          </nav>
          <div class="auth-section">
            <div class="auth-title">🔐 Authentication</div>
            <p class="auth-desc">All endpoints require <code>x-api-key</code> header.</p>
            <input type="text" placeholder="Your API key..."
              [ngModel]="globalApiKey()" (ngModelChange)="setGlobalApiKey($event)" class="api-key-input" />
          </div>
        </aside>

        <main class="content">
          <section class="intro-section">
            <h1>API Reference</h1>
            <p>Access real-time football, FPL, and F1 data through our B2B API.</p>
            <div class="tier-cards">
              <div class="tier-card"><div class="tier-name">Starter</div><div class="tier-limits">30 req/min · 1K/day</div></div>
              <div class="tier-card"><div class="tier-name">Growth</div><div class="tier-limits">120 req/min · 10K/day</div></div>
              <div class="tier-card featured"><div class="tier-name">Enterprise</div><div class="tier-limits">600 req/min · 100K/day</div></div>
            </div>
          </section>

          @for (ep of filteredEndpoints(); track ep.id) {
            <section class="endpoint-card" [id]="ep.id">
              <div class="endpoint-header">
                <span class="method-badge large" [class]="ep.method.toLowerCase()">{{ ep.method }}</span>
                <span class="endpoint-path">{{ ep.path }}</span>
                <span class="endpoint-summary">{{ ep.summary }}</span>
              </div>
              <div class="endpoint-body">
                <p class="endpoint-desc">{{ ep.description }}</p>

                @if (ep.parameters.length > 0) {
                  <div class="section-label">Parameters</div>
                  <table class="params-table">
                    <thead><tr><th>Name</th><th>In</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                    <tbody>
                      @for (param of ep.parameters; track param.name) {
                        <tr>
                          <td><code>{{ param.name }}</code></td>
                          <td><span class="param-in">{{ param.in }}</span></td>
                          <td><span class="param-type">{{ param.type }}</span></td>
                          <td>@if (param.required) { <span class="req-badge">required</span> } @else { <span class="opt-badge">optional</span> }</td>
                          <td>{{ param.description }} @if (param.enum) { <br/><span class="param-enum">{{ param.enum.join(', ') }}</span> }</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }

                <div class="section-label">Response Type</div>
                <div class="code-block"><button class="copy-btn" (click)="copyText(ep.responseType)">Copy</button>
                  <pre><code [innerHTML]="highlightTS(ep.responseType)"></code></pre></div>

                <div class="section-label">Example Response</div>
                <div class="code-block"><button class="copy-btn" (click)="copyText(ep.responseExample)">Copy</button>
                  <pre><code [innerHTML]="highlightJSON(ep.responseExample)"></code></pre></div>

                <div class="section-label">Try It</div>
                <div class="try-it">
                  <div class="try-fields">
                    @if (ep.auth) {
                      <div class="field"><label>x-api-key</label>
                        <input type="text" [value]="globalApiKey()" (input)="setGlobalApiKey(inputVal($event))" placeholder="API key" /></div>
                    }
                    @for (p of ep.parameters; track p.name) {
                      @if (p.in !== 'header') {
                        <div class="field"><label>{{ p.name }} @if (p.required) { <span class="req">*</span> }</label>
                          @if (p.enum) {
                            <select [value]="getParam(ep.id, p.name)" (change)="setParam(ep.id, p.name, inputVal($event))">
                              <option value="">--</option>
                              @for (o of p.enum; track o) { <option [value]="o">{{ o }}</option> }
                            </select>
                          } @else {
                            <input [type]="p.type === 'number' ? 'number' : 'text'" [placeholder]="p.example"
                              [value]="getParam(ep.id, p.name)" (input)="setParam(ep.id, p.name, inputVal($event))" />
                          }
                        </div>
                      }
                    }
                  </div>
                  <button class="send-btn" (click)="send(ep)" [disabled]="getState(ep.id).loading">
                    @if (getState(ep.id).loading) { ⏳ Sending... } @else { 🚀 Send Request }
                  </button>
                  @if (getState(ep.id).response) {
                    <div class="resp-panel">
                      <div class="resp-header">
                        <span class="status" [class]="statusClass(getState(ep.id).statusCode)">{{ getState(ep.id).statusCode }}</span>
                        <span class="resp-time">{{ getState(ep.id).responseTime }}ms</span>
                        <button class="copy-btn" (click)="copyText(getState(ep.id).response)">Copy</button>
                      </div>
                      <pre class="resp-body"><code [innerHTML]="highlightJSON(getState(ep.id).response)"></code></pre>
                    </div>
                  }
                </div>
              </div>
            </section>
          }
        </main>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; background: #060D18; color: #E8ECF1; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .api-docs { display: flex; flex-direction: column; min-height: 100vh; }
    .top-bar { background: #0A1628; border-bottom: 1px solid #1A2744; padding: 12px 24px; position: sticky; top: 0; z-index: 100; }
    .top-bar-inner { display: flex; align-items: center; justify-content: space-between; max-width: 1600px; margin: 0 auto; width: 100%; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .logo { font-size: 24px; }
    .title { font-size: 18px; font-weight: 700; color: #D4A847; }
    .version { font-size: 12px; background: #D4A847; color: #060D18; padding: 2px 8px; border-radius: 10px; font-weight: 600; }
    .base-url { font-family: monospace; font-size: 13px; color: #8B9DC3; }
    .layout { display: flex; flex: 1; max-width: 1600px; margin: 0 auto; width: 100%; }
    .sidebar { width: 280px; min-width: 280px; background: #0A1628; border-right: 1px solid #1A2744; padding: 16px; position: sticky; top: 52px; height: calc(100vh - 52px); overflow-y: auto; display: flex; flex-direction: column; }
    .search-input, .api-key-input { width: 100%; padding: 8px 12px; background: #0F1D32; border: 1px solid #1A2744; border-radius: 6px; color: #E8ECF1; font-size: 13px; outline: none; box-sizing: border-box; }
    .search-input:focus, .api-key-input:focus { border-color: #D4A847; }
    .search-box { margin-bottom: 16px; }
    .nav { flex: 1; overflow-y: auto; }
    .nav-category { margin-bottom: 16px; }
    .nav-category-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #D4A847; margin-bottom: 6px; letter-spacing: 0.5px; }
    .nav-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 5px 8px; border: none; background: transparent; color: #8B9DC3; cursor: pointer; border-radius: 4px; font-size: 13px; text-align: left; }
    .nav-item:hover { background: #0F1D32; color: #E8ECF1; }
    .nav-item.active { background: #1A2744; color: #D4A847; }
    .method-badge { font-family: monospace; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
    .method-badge.large { font-size: 12px; padding: 4px 10px; }
    .method-badge.get { background: rgba(59,130,246,0.2); color: #3B82F6; }
    .method-badge.post { background: rgba(0,214,143,0.2); color: #00D68F; }
    .method-badge.delete { background: rgba(239,68,68,0.2); color: #EF4444; }
    .auth-section { border-top: 1px solid #1A2744; padding-top: 16px; margin-top: auto; }
    .auth-title { font-size: 13px; font-weight: 600; color: #D4A847; margin-bottom: 6px; }
    .auth-desc { font-size: 12px; color: #8B9DC3; margin: 0 0 8px; }
    .auth-desc code { font-family: monospace; background: #0F1D32; padding: 1px 4px; border-radius: 3px; color: #D4A847; font-size: 11px; }
    .api-key-input { font-family: monospace; font-size: 12px; }
    .content { flex: 1; padding: 32px; overflow-y: auto; }
    .intro-section { margin-bottom: 40px; }
    .intro-section h1 { font-size: 28px; margin: 0 0 8px; }
    .intro-section p { color: #8B9DC3; margin: 0 0 24px; }
    .tier-cards { display: flex; gap: 16px; }
    .tier-card { flex: 1; background: #0A1628; border: 1px solid #1A2744; border-radius: 8px; padding: 16px; text-align: center; }
    .tier-card.featured { border-color: #D4A847; }
    .tier-name { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
    .tier-card.featured .tier-name { color: #D4A847; }
    .tier-limits { font-size: 13px; color: #8B9DC3; font-family: monospace; }
    .endpoint-card { background: #0A1628; border: 1px solid #1A2744; border-radius: 8px; margin-bottom: 24px; overflow: hidden; }
    .endpoint-header { padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    .endpoint-path { font-family: monospace; font-size: 14px; }
    .endpoint-summary { color: #8B9DC3; font-size: 13px; margin-left: auto; }
    .endpoint-body { padding: 0 20px 20px; }
    .endpoint-desc { color: #8B9DC3; font-size: 14px; margin: 0 0 16px; }
    .section-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #D4A847; margin: 20px 0 8px; letter-spacing: 0.5px; }
    .params-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .params-table th { text-align: left; padding: 8px 12px; background: #0F1D32; color: #8B9DC3; font-weight: 600; font-size: 11px; text-transform: uppercase; }
    .params-table td { padding: 8px 12px; border-top: 1px solid #1A2744; }
    .params-table code { font-family: monospace; color: #3B82F6; }
    .param-in { font-size: 11px; background: #0F1D32; padding: 2px 6px; border-radius: 3px; color: #8B9DC3; }
    .param-type { font-family: monospace; font-size: 12px; color: #D4A847; }
    .req-badge { font-size: 10px; background: rgba(239,68,68,0.2); color: #EF4444; padding: 2px 6px; border-radius: 3px; font-weight: 600; }
    .opt-badge { font-size: 10px; background: rgba(139,157,195,0.1); color: #8B9DC3; padding: 2px 6px; border-radius: 3px; }
    .param-enum { font-size: 11px; color: #00D68F; font-family: monospace; }
    .code-block { background: #0B1120; border: 1px solid #1A2744; border-radius: 6px; padding: 16px; position: relative; overflow-x: auto; }
    .code-block pre { margin: 0; font-family: monospace; font-size: 13px; line-height: 1.6; white-space: pre; }
    .copy-btn { position: absolute; top: 8px; right: 8px; background: #1A2744; border: none; color: #8B9DC3; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; z-index: 1; }
    .copy-btn:hover { background: #D4A847; color: #060D18; }
    .ts-kw { color: #D4A847; } .ts-type { color: #3B82F6; } .ts-str { color: #00D68F; } .ts-num { color: #F59E0B; } .ts-punct { color: #4A5568; } .ts-cmt { color: #4A5568; font-style: italic; }
    .j-key { color: #E8ECF1; } .j-str { color: #00D68F; } .j-num { color: #F59E0B; } .j-bool { color: #D4A847; } .j-null { color: #8B9DC3; }
    .try-it { background: #0B1120; border: 1px solid #1A2744; border-radius: 6px; padding: 16px; }
    .try-fields { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin-bottom: 16px; }
    .field label { display: block; font-size: 12px; color: #8B9DC3; margin-bottom: 4px; }
    .field .req { color: #EF4444; }
    .field input, .field select { width: 100%; padding: 8px 12px; background: #0F1D32; border: 1px solid #1A2744; border-radius: 4px; color: #E8ECF1; font-family: monospace; font-size: 12px; outline: none; box-sizing: border-box; }
    .field input:focus, .field select:focus { border-color: #D4A847; }
    .send-btn { background: #D4A847; color: #060D18; border: none; padding: 10px 24px; border-radius: 6px; font-weight: 700; font-size: 14px; cursor: pointer; }
    .send-btn:hover { background: #E5BC5E; }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .resp-panel { margin-top: 16px; background: #060D18; border: 1px solid #1A2744; border-radius: 6px; overflow: hidden; }
    .resp-header { display: flex; align-items: center; gap: 12px; padding: 8px 12px; background: #0A1628; border-bottom: 1px solid #1A2744; position: relative; }
    .status { font-family: monospace; font-size: 12px; font-weight: 700; padding: 2px 8px; border-radius: 3px; }
    .status.s2 { background: rgba(0,214,143,0.2); color: #00D68F; }
    .status.s4 { background: rgba(245,158,11,0.2); color: #F59E0B; }
    .status.s5 { background: rgba(239,68,68,0.2); color: #EF4444; }
    .resp-time { font-size: 12px; color: #8B9DC3; font-family: monospace; }
    .resp-body { padding: 12px; margin: 0; font-family: monospace; font-size: 12px; line-height: 1.5; overflow-x: auto; max-height: 400px; overflow-y: auto; }
    @media (max-width: 900px) { .sidebar { display: none; } .tier-cards { flex-direction: column; } }
  `],
})
export class ApiDocsPage {
  readonly baseUrl = API_BASE_URL;
  readonly apiVersion = API_VERSION;
  readonly categories = CATEGORY_ORDER;
  readonly categoryLabels = CATEGORY_LABELS;
  readonly endpoints = API_ENDPOINTS;

  searchQuery = signal('');
  activeEndpoint = signal('');
  globalApiKey = signal(this.loadKey());

  private params: Record<string, Record<string, string>> = {};
  private states: Record<string, TryItState> = {};

  filteredEndpoints = computed((): ApiEndpoint[] => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.endpoints;
    return this.endpoints.filter((ep: ApiEndpoint) =>
      ep.summary.toLowerCase().includes(q) || ep.path.toLowerCase().includes(q) ||
      ep.tags.some((t: string) => t.includes(q))
    );
  });

  getEndpointsByCategory(cat: string): ApiEndpoint[] {
    return this.filteredEndpoints().filter((ep: ApiEndpoint) => ep.category === cat);
  }

  scrollToEndpoint(id: string): void {
    this.activeEndpoint.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  setGlobalApiKey(key: string): void {
    this.globalApiKey.set(key);
    try { localStorage.setItem('b2b-api-key', key); } catch { /* noop */ }
  }

  getParam(eid: string, name: string): string { return this.params[eid]?.[name] ?? ''; }
  setParam(eid: string, name: string, val: string): void {
    if (!this.params[eid]) this.params[eid] = {};
    this.params[eid][name] = val;
  }

  getState(eid: string): TryItState {
    if (!this.states[eid]) this.states[eid] = { loading: false, response: '', statusCode: 0, responseTime: 0, error: false };
    return this.states[eid];
  }

  statusClass(code: number): string {
    if (code >= 200 && code < 300) return 's2';
    if (code >= 400 && code < 500) return 's4';
    return 's5';
  }

  inputVal(e: Event): string { return (e.target as HTMLInputElement).value; }

  async send(ep: ApiEndpoint): Promise<void> {
    const st = this.getState(ep.id);
    st.loading = true; st.response = '';
    const p = this.params[ep.id] || {};
    const qp = new URLSearchParams();
    ep.parameters.forEach((param: ApiParameter) => { if (param.in === 'query' && p[param.name]) qp.set(param.name, p[param.name]); });
    const url = `${this.baseUrl}/${ep.functionName}${qp.toString() ? '?' + qp.toString() : ''}`;
    const hdrs: Record<string, string> = {};
    if (ep.auth) hdrs['x-api-key'] = this.globalApiKey();
    ep.parameters.forEach((param: ApiParameter) => { if (param.in === 'header' && p[param.name]) hdrs[param.name] = p[param.name]; });
    const t0 = performance.now();
    try {
      const r = await fetch(url, { method: ep.method, headers: hdrs });
      const body = await r.text();
      st.statusCode = r.status; st.responseTime = Math.round(performance.now() - t0); st.error = r.status >= 400;
      try { st.response = JSON.stringify(JSON.parse(body), null, 2); } catch { st.response = body; }
    } catch (err: unknown) {
      st.statusCode = 0; st.responseTime = Math.round(performance.now() - t0); st.error = true;
      st.response = `Network error: ${err instanceof Error ? err.message : 'Unknown'}`;
    }
    st.loading = false;
  }

  highlightTS(code: string): string {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/(\/\/.*)/g, '<span class="ts-cmt">$1</span>')
      .replace(/\b(interface|type|export|const|null)\b/g, '<span class="ts-kw">$1</span>')
      .replace(/\b(string|number|boolean)\b/g, '<span class="ts-type">$1</span>')
      .replace(/"([^"]*?)"/g, '<span class="ts-str">"$1"</span>')
      .replace(/\b(\d+)\b/g, '<span class="ts-num">$1</span>');
  }

  highlightJSON(code: string): string {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"([^"]*?)"(\s*:)/g, '<span class="j-key">"$1"</span>$2')
      .replace(/:\s*"([^"]*?)"/g, ': <span class="j-str">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="j-num">$1</span>')
      .replace(/:\s*(true|false)/g, ': <span class="j-bool">$1</span>')
      .replace(/:\s*(null)/g, ': <span class="j-null">$1</span>');
  }

  copyText(text: string): void { navigator.clipboard.writeText(text).catch(() => {}); }
  private loadKey(): string { try { return localStorage.getItem('b2b-api-key') || ''; } catch { return ''; } }
}
