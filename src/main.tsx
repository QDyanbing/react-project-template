import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

function App() {
  return (
    <main>
      <h1>React Project Template</h1>
    </main>
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
