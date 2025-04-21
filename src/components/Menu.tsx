import {
	IonContent,
	IonIcon,
	IonItem,
	IonLabel,
	IonList,
	IonListHeader,
	IonMenu,
	IonMenuToggle,
	IonNote,
} from '@ionic/react';

import { useLocation } from 'react-router-dom';
import { LogOutButton } from './logout-button';
import { UserSessionContext } from './user-session-provider';
import { useContext } from 'react';
import { APP_ROUTES } from '../app-routes';

import './Menu.css';

export function Menu()
{
	const userSession = useContext(UserSessionContext);
	const location = useLocation();

	let visibleRoutes = APP_ROUTES;
	let userRoles: string[] = [];
	if (userSession.loggedIn) {
		userRoles = userSession.user!.roles;
	}

	visibleRoutes = APP_ROUTES.filter(
		route => route.userNavigatable &&
			(route.allowedRoles.length == 0 ||
			 userRoles.some(userRole => route.allowedRoles.some(allowedRole => userRole == allowedRole))
			)
	);

	return (
		<IonMenu contentId="main" type="overlay">
			<IonContent>
				<IonList id="inbox-list">
					<IonListHeader>Ionic — Firebase Integration</IonListHeader>
					<IonNote>{userSession.user!.emailAddress}</IonNote>
					{
						visibleRoutes.map((route, index) => (
								<IonMenuToggle key={index} autoHide={false}>
									<IonItem className={location.pathname === route.path ? "selected" : ""} routerLink={route.path} routerDirection="root" lines="none" detail={false}>
										<IonIcon aria-hidden="true" slot="start" icon={route.icon} />
										<IonLabel>{route.title}</IonLabel>
									</IonItem>
								</IonMenuToggle>
							)
						)
					}
				</IonList>

				<LogOutButton/>
			</IonContent>
		</IonMenu>
	);
};

export default Menu;
