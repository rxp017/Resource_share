const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const HAS_ANON_KEY =
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY) &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'REPLACE_ME_WITH_THE_ANON_PUBLIC_KEY'

function App() {
  return (
    <main className="page">
      <h1>HITAM Resource Share</h1>
      <p className="tagline">
        Campus resource sharing and marketplace for verified HITAM students -
        buy, sell, lend, borrow and rent with clear exchange records.
      </p>
      <ul className="status-list">
        <li>Scaffold: P02 (build/typecheck gate pending)</li>
        <li>Supabase URL configured: {SUPABASE_URL ? 'yes' : 'no - create .env'}</li>
        <li>Supabase anon key configured: {HAS_ANON_KEY ? 'yes' : 'no - edit .env'}</li>
        <li>Design system (Pulse/Calm): P04</li>
        <li>Sign-in (Google, @hitam.org only): P03</li>
      </ul>
      <p className="note">
        This page is the P02 scaffold check. No feature is implemented yet;
        nothing on it implies working marketplace behavior.
      </p>
    </main>
  )
}

export default App