export default function Home() {
  return (
    <main className="app-shell">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-16">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="panel-card p-8 lg:p-10">
            <p className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              Doctor Poster Platform
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
              Create and manage posters with speed and control
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Employees generate downloadable doctor posters from approved templates. Admins control template
              branding, user access via CSV, and complete creation audit logs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="primary-btn px-5 py-2.5 text-sm" href="/employee/login">
                Employee Portal
              </a>
              <a
                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                href="/admin"
              >
                Open Admin Panel
              </a>
            </div>
          </div>
          <aside className="panel-card p-8">
            <h2 className="text-lg font-semibold text-slate-900">Platform Includes</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Template library with custom name color</li>
              <li>Employee login from CSV-imported users only</li>
              <li>Doctor poster preview and one-click download</li>
              <li>Audit of who created which poster and when</li>
            </ul>
          </aside>
        </div>
      </section>
    </main>
  );
}
