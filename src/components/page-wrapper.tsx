import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import NotificationsPopup from "../components/notification/notification-popup";
import { PropsWithChildren } from "react";

interface PageWrapperData extends PropsWithChildren
{
	title: string;
}

export function PageWrapper(data: PageWrapperData)
{
	return (
		<IonPage>
			<IonHeader>
				<IonToolbar>
					<IonButtons slot="start">
						<IonMenuButton />
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
