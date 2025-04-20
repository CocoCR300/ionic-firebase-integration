import { IonApp, IonLabel, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Page from './pages/Page';

import '@ionic/react/css/core.css';

import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import LoginPage from './pages/login-page';
import { ReactNode, useContext, useEffect, useState } from 'react';
import { UserSessionContext } from './components/user-session-provider';
import UserInfoPage from './pages/user-info-page';
import PushNotificationsPage  from "./pages/push-notifications";
import { firebasePersistencePromise } from './services/firebase';
import { delay } from './util/promise';
import TopicSubscription from './components/notification/topic-subscription';

setupIonicReact();

export default function App()
{
	const userSession = useContext(UserSessionContext);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		awaitFirebaseInitialization();
	}, []);

	async function awaitFirebaseInitialization() {
		try {
			await delay(2000);
			await firebasePersistencePromise;
		} finally {
			setLoading(false);
		}
	}

	let content: ReactNode;
	if (loading) {
		content = (
			<div style={{ alignItems: "center", display: "flex", flexFlow: "column", height: "100%", justifyContent: "center" }}>
				<div style={{ background: "white", clipPath: "circle(40%)", padding: "1em"  }}>
					<img src="spinning-orange.gif"></img>
				</div>
				<IonLabel style={{ maxWidth: "40%", textAlign: "center" }}>
					<h1 style={{ marginBottom: "1em" }}>Loading</h1>
					<h4>Remember to add the required environment variables (see the src/vite-env.d.ts file)</h4>
					<h6>I added a new one, so keep that in mind</h6>
				</IonLabel>
			</div>
	   );
	}
	else if (!userSession.loggedIn) {
		content = (<LoginPage/>);
	}
	else {
		content = (
			<IonReactRouter>
				<IonSplitPane contentId="main">
					<Menu />
					<IonRouterOutlet id="main">
						<Route path="/login" exact={true}>
							<LoginPage/>
						</Route>
						<Route path="/user-info" exact={true}>
							<UserInfoPage/>
						</Route>
						<Route path="/topics" exact={true}>
							<TopicSubscription/>
						</Route>
						<Route path="/push-notifications" exact={true}>
							<PushNotificationsPage/>
						</Route>
						<Route path="/" exact={true}>
							<Redirect to="/folder/Inbox" />
						</Route>
						<Route path="/folder/:name" exact={true}>
							<Page />
						</Route>
					</IonRouterOutlet>
				</IonSplitPane>
			</IonReactRouter>
		); 
	}

	return (
		<IonApp>
			{ content }
		</IonApp>
	);
}

