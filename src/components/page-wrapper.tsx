import { IonBackButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import NotificationsPopup from "../components/notification/notification-popup";
import { PropsWithChildren } from "react";
import { useHistory } from "react-router";

interface PageWrapperData extends PropsWithChildren
{
	showMenuButton?: boolean;
	title: string;
}

export function PageWrapper({ showMenuButton = true, ...data }: PageWrapperData)
{
	const navigator = useHistory();

	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonBackButton/>
						{ showMenuButton && <IonMenuButton /> }
					</IonButtons>
					<IonTitle>{data.title}</IonTitle>

					<IonButtons slot="end">
						<NotificationsPopup />
					</IonButtons>
				</IonToolbar>
			</IonHeader>

			{ data.children }
		</IonPage>
	);
};
