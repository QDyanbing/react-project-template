import { Link, Outlet } from '@tanstack/react-router';

export function RootLayout() {
  return (
    <>
      <header>
        <nav aria-label="Main navigation">
          <Link to="/">Home</Link>
          {' · '}
          <Link to="/about">About</Link>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
