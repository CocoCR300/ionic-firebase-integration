import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';

export default function UnauthorizedPage() {
	return (
		<IonPage>
			<IonContent fullscreen>
				<IonHeader collapse="condense">
					<IonToolbar>
						<IonTitle size="large">Unauthorized</IonTitle>
					</IonToolbar>
				</IonHeader>
				<ExploreContainer text="You don't have permission to see this content"/>
			</IonContent>
		</IonPage>
	);
};
