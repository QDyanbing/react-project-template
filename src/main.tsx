import { createRoot } from 'react-dom/client';

import App from '@/App';
import '@/global.less';
import '@/i18n';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(<App />);
