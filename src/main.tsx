import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { UserSessionProvider } from './components/user-session-provider';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
	<React.StrictMode>
		<UserSessionProvider>
			<App />
		</UserSessionProvider>
	</React.StrictMode>
);
