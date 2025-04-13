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
import { archiveOutline, archiveSharp, heartOutline, heartSharp, logIn, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { LogOutButton } from './logout-button';

interface AppPage {
	url: string;
	iosIcon: string;
	mdIcon: string;
	title: string;
}

const appPages: AppPage[] = [
	{
		title: 'Login',
		url: '/login',
		iosIcon: logIn,
		mdIcon: logIn
	},
	{
		title: 'Inbox',
		url: '/folder/Inbox',
		iosIcon: mailOutline,
		mdIcon: mailSharp
	},
	{
		title: 'Outbox',
		url: '/folder/Outbox',
		iosIcon: paperPlaneOutline,
		mdIcon: paperPlaneSharp
	},
	{
		title: 'Favorites',
		url: '/folder/Favorites',
		iosIcon: heartOutline,
		mdIcon: heartSharp
	},
	{
		title: 'Archived',
		url: '/folder/Archived',
		iosIcon: archiveOutline,
		mdIcon: archiveSharp
	},
	{
		title: 'Trash',
		url: '/folder/Trash',
		iosIcon: trashOutline,
		mdIcon: trashSharp
	},
	{
		title: 'Spam',
		url: '/folder/Spam',
		iosIcon: warningOutline,
		mdIcon: warningSharp
	}
];

export function Menu()
{
	const location = useLocation();

	return (
		<IonMenu contentId="main" type="overlay">
			<IonContent>
				<IonList id="inbox-list">
					<IonListHeader>Inbox</IonListHeader>
					<IonNote>hi@ionicframework.com</IonNote>
					{appPages.map((appPage, index) => {
						return (
							<IonMenuToggle key={index} autoHide={false}>
								<IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
									<IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
									<IonLabel>{appPage.title}</IonLabel>
								</IonItem>
							</IonMenuToggle>
						);
					})}
				</IonList>

				<LogOutButton/>
			</IonContent>
		</IonMenu>
	);
};

export default Menu;
