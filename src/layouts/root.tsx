import { Link, Outlet } from '@tanstack/react-router';

export function RootLayout() {
  return (
    <>
      <header>
        <nav aria-label="主导航">
          <Link to="/">首页</Link>
          {' · '}
          <Link to="/about">关于</Link>
        </nav>
      </header>
      <Outlet />
    </>
  );
}
