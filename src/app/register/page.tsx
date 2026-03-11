export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">Register to personalize notifications and dashboards.</p>

        <form className="mt-6 space-y-4">
          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Email</span>
            <input
              type="email"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2"
              placeholder="name@company.com"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block text-[var(--muted)]">Password</span>
            <input type="password" className="w-full rounded-lg border border-[var(--border)] px-3 py-2" />
          </label>

          <button
            type="button"
            className="w-full rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-semibold text-white"
          >
            Create account
          </button>
        </form>

        <p className="mt-4 text-xs text-[var(--muted)]">
          Registration service is currently unavailable in this training environment.
        </p>
      </section>
    </main>
  );
}
