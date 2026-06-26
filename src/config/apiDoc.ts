import type { Application, RequestHandler } from 'express';
import type { Router } from 'express-serve-static-core';

/** ------- Route Inspection Types ------- */
type HTTPMethod =
  | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE' | 'CONNECT';

interface RouteInfo {
  method: HTTPMethod;
  fullPath: string;
  middlewares: string[];
}

interface GroupNode {
  name: string;             // e.g. "masters"
  fullPath: string;         // e.g. "/api/masters"
  children: Map<string, GroupNode>;
  apis: RouteInfo[];        // routes that terminate at this node
}

/** ------- Public entrypoint: call from app.use('/api', ...) ------- */
export function listRoutes(app: Application, res: any): void {
  const allRoutes = extractRoutes(app)
    .filter(r => r.fullPath.startsWith('/api/'))              // only /api/*
    .sort((a, b) => a.fullPath.localeCompare(b.fullPath) || a.method.localeCompare(b.method));

  const root = buildGroupTree(allRoutes);

  const html = renderHTML(root, allRoutes.length);
  res.status(200).send(html);
}

/** ------- Extract all routes (includes nested routers) ------- */
function extractRoutes(appOrRouter: Application | Router, base = ''): RouteInfo[] {
  const stack: any[] = (appOrRouter as any)._router?.stack ?? (appOrRouter as any).stack ?? [];
  const collected: RouteInfo[] = [];

  for (const layer of stack) {
    // Route with methods (e.g., router.get('/x', ...))
    if (layer.route) {
      const routePath = joinPaths(base, layer.route.path);
      const methods = Object.keys(layer.route.methods || {})
        .filter(Boolean)
        .map(m => m.toUpperCase()) as HTTPMethod[];
      const middlewares = (layer.route.stack || [])
        .map((l: any) => safeName(l.name))
        .filter(Boolean);

      for (const method of methods) {
        collected.push({
          method,
          fullPath: routePath,
          middlewares,
        });
      }
      continue;
    }

    // Nested router (e.g., router.use('/v1', subRouter))
    if (layer.name === 'router' || layer.handle?.stack) {
      const prefix = mountPathFromLayer(layer);
      const childBase = joinPaths(base, prefix);
      collected.push(...extractRoutes(layer.handle, childBase));
      continue;
    }
  }

  return collected;
}

/** Try to recover the mount path for a layer (works for most common cases) */
function mountPathFromLayer(layer: any): string {
  // Express sometimes provides layer.regexp + layer.keys for params; sometimes layer.path is there.
  if (layer.path) return layer.path;

  const keys = (layer.keys || []).map((k: any) => `:${k.name}`);
  const rx: RegExp | undefined = layer.regexp;
  if (!rx || (rx as any).fast_slash) return '';

  // Convert common express mount regex to string path (best-effort)
  let src = rx.source
    .replace('^\\/', '/')           // start slash
    .replace('\\/?(?=\\/|$)', '')   // optional trailing slash
    .replace('(?=\\/|$)', '')       // end lookahead
    .replace('^', '')
    .replace('$', '');

  // Replace param capture groups with :param
  let i = 0;
  src = src.replace(/\(\?:\(\[\^\\\/]\+\?\)\)/g, () => keys[i++] || ':param');

  // Clean up escaped slashes
  src = src.replace(/\\\//g, '/');

  return src || '';
}

function joinPaths(a: string, b: string): string {
  const as = a.endsWith('/') ? a.slice(0, -1) : a;
  const bs = b.startsWith('/') ? b : `/${b}`;
  return (as + bs) || '/';
}

function safeName(name: string | undefined): string {
  if (!name) return '';
  // Express often uses "bound " prefix; trim it.
  return String(name).replace(/^bound\s+/, '');
}

/** ------- Build grouping tree by each path segment after /api ------- */
function buildGroupTree(routes: RouteInfo[]): GroupNode {
  const root: GroupNode = { name: 'api', fullPath: '/api', children: new Map(), apis: [] };

  for (const r of routes) {
    // Strip leading /api, split remaining into segments
    const rest = r.fullPath.replace(/^\/api\/?/, ''); // e.g., "masters/users"
    const segments = rest ? rest.split('/').filter(Boolean) : [];

    let node = root;
    // If route is exactly /api, park its methods at root
    if (segments.length === 0) {
      node.apis.push(r);
      continue;
    }

    let pathSoFar = '/api';
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      pathSoFar = joinPaths(pathSoFar, seg);
      if (!node.children.has(seg)) {
        node.children.set(seg, { name: seg, fullPath: pathSoFar, children: new Map(), apis: [] });
      }
      node = node.children.get(seg)!;

      // If this is the final segment, attach the route to this node
      if (i === segments.length - 1) {
        node.apis.push(r);
      }
    }
  }

  return root;
}

/** ------- Count APIs recursively in a group ------- */
function countAPIs(node: GroupNode): number {
  let count = node.apis.length;
  for (const child of node.children.values()) count += countAPIs(child);
  return count;
}

/** ------- Method -> BG color as requested ------- */
function bg(method: string): string {
  if (method.includes('GET')) return 'lightgreen';
  if (method.includes('POST')) return 'skyblue';
  if (method.includes('PUT')) return 'orange';
  return '#FF61D2'; // DELETE, PATCH, etc.
}

/** ------- Render HTML (Tailwind + soft UI + collapsible groups) ------- */
function renderHTML(root: GroupNode, total: number): string {
  const head = `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,viewport-fit=cover"
    />
    <title>API Explorer – /api/*</title>
    <!-- Tailwind (CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Soft UI touches */
      body{ background: #f7f9fc; }
      .soft-card{
        background: #fff;
        border-radius: 16px;
        box-shadow:
          0 10px 30px rgba(0,0,0,0.06),
          0 1px 2px rgba(0,0,0,0.03);
      }
      .badge{
        display:inline-block; padding:6px 10px; border-radius: 9999px; font-weight:600;
        border: 1px solid rgba(0,0,0,0.08);
      }
      .rotate-90{ transform: rotate(90deg); }
      .method-cell{ color:#111; font-weight:600; border-radius: 8px; padding:6px 10px; }
      .table-soft th{
        background:#f2f6fc; font-weight:700; color:#334; border-bottom:1px solid #e8eef6;
      }
      .table-soft td{
        border-bottom:1px solid #f0f4fa;
      }
      .mono{ font-variant-ligatures:none; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      .fade{ color:#6b7280; }
      .group-row{ cursor:pointer; }
    </style>
  </head>
  <body class="min-h-screen">
    <div class="max-w-6xl mx-auto px-4 py-8">
      <header class="mb-6">
        <h1 class="text-3xl font-extrabold tracking-tight text-slate-900">API Explorer</h1>
        <p class="fade mt-1">Listing all routes under <span class="font-semibold">/api/*</span>. Total APIs: <span class="font-semibold">${total}</span></p>
      </header>

      ${renderGroup(root, true)}

      <footer class="mt-10 fade text-sm">
        Generated from Express router at runtime.
      </footer>
    </div>

    <script>
      // Simple collapse/expand toggle
      document.addEventListener('click', (e) => {
        const row = e.target.closest('[data-toggle]');
        if (!row) return;
        const id = row.getAttribute('data-toggle');
        const target = document.getElementById(id);
        if (!target) return;

        const chevron = row.querySelector('[data-chevron]');
        const isHidden = target.classList.contains('hidden');
        target.classList.toggle('hidden');
        if (chevron) chevron.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
      });

      // Expand/collapse all
      function setAll(open) {
        document.querySelectorAll('[data-group-panel]').forEach(el => {
          el.classList.toggle('hidden', !open);
        });
        document.querySelectorAll('[data-chevron]').forEach(ch => {
          ch.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
        });
      }
      window.expandAll = () => setAll(true);
      window.collapseAll = () => setAll(false);
    </script>
  </body>
  </html>`;

  return head;
}

let groupSerialCounter = 1;

function renderGroup(node: GroupNode, isRoot = false): string {
  // Don’t display the synthetic "api" node header as a group, only its children
  if (isRoot) {
    const controls = `
      <div class="flex items-center gap-2 mb-4">
        <button onclick="expandAll()" class="badge bg-white hover:bg-slate-50">Expand all</button>
        <button onclick="collapseAll()" class="badge bg-white hover:bg-slate-50">Collapse all</button>
      </div>
    `;
    const children = Array.from(node.children.values())
      .sort((a, b) => a.fullPath.localeCompare(b.fullPath))
      .map(child => renderGroup(child))
      .join('');
    // If there are APIs directly on /api itself, show them too
    const rootApis = node.apis.length ? renderTable(node) : '';
    return controls + rootApis + children;
  }

  const id = `panel-${hash(node.fullPath)}`;
  const serial = groupSerialCounter++;
  const totalInGroup = countAPIs(node);

  const header = `
  <div
    data-toggle="${id}"
    class="soft-card group-row mb-2 px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <span data-chevron class="transition-transform duration-150 inline-block">▶</span>
      <div>
        <div class="text-sm uppercase tracking-wide fade">Group ${serial}</div>
        <div class="font-bold mono text-lg">${node.fullPath}</div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="badge bg-white">APIs in group: <strong>${totalInGroup}</strong></span>
    </div>
  </div>`;

  const bodyTables = `
    <div id="${id}" data-group-panel class="hidden ml-6 mb-6">
      ${node.apis.length ? renderTable(node) : ''}
      ${Array.from(node.children.values())
        .sort((a, b) => a.fullPath.localeCompare(b.fullPath))
        .map(child => renderGroup(child))
        .join('')}
    </div>
  `;

  return header + bodyTables;
}

function renderTable(node: GroupNode): string {
  // Deduplicate by (path, method) but keep per-method row, and compute counts
  const rows = node.apis
    .slice()
    .sort((a, b) => a.fullPath.localeCompare(b.fullPath) || a.method.localeCompare(b.method));

  // Count how many methods per path to show "# of APIs under group" per *path* row if you want,
  // but the requirement asks for a column giving number of APIs under group — we show it in header,
  // and inside the table we give per-path method counts as well.
  const perPathCount = new Map<string, number>();
  for (const r of rows) {
    perPathCount.set(r.fullPath, (perPathCount.get(r.fullPath) || 0) + 1);
  }

  let sn = 1;
  const trs = rows.map(r => {
    const methodBg = bg(r.method);
    const countForPath = perPathCount.get(r.fullPath) || 1;
    return `
      <tr class="hover:bg-slate-50">
        <td class="px-3 py-2 text-sm text-slate-600">${sn++}</td>
        <td class="px-3 py-2 mono">${r.fullPath}</td>
        <td class="px-3 py-2 text-center">${countForPath}</td>
        <td class="px-3 py-2">
          <span class="method-cell" style="background:${methodBg}">${r.method}</span>
        </td>
        <td class="px-3 py-2 text-sm">
          ${r.middlewares.map(m => `<span class="badge bg-white mr-1">${escapeHtml(m)}</span>`).join('') || '<span class="fade">–</span>'}
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="soft-card overflow-hidden mb-4">
      <div class="px-4 py-3 border-b border-slate-200 bg-white/80">
        <div class="font-semibold">Endpoints directly under <span class="mono">${node.fullPath}</span></div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full table-soft">
          <thead>
            <tr>
              <th class="px-3 py-2 text-left">S.No</th>
              <th class="px-3 py-2 text-left">API</th>
              <th class="px-3 py-2 text-center"># APIs (this path)</th>
              <th class="px-3 py-2 text-left">Method</th>
              <th class="px-3 py-2 text-left">Middlewares</th>
            </tr>
          </thead>
          <tbody>
            ${trs || `<tr><td colspan="5" class="px-3 py-4 text-center fade">No endpoints at this level.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/** ------- Small helpers for HTML safety / ids ------- */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c] as string)
  );
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
  return String(Math.abs(h));
}