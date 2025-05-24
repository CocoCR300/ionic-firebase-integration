import { ReactNode } from "react";
import { UserRoleName } from "./model/user-role";
import PushNotificationsPage from "./pages/push-notifications";
import UserInfoPage from "./pages/user-info-page";
import TopicsPage from "./pages/topics-page";
import { barcode, camera, chatbubble, cloud, home, image, person, qrCode } from "ionicons/icons";
import Page from "./pages/Page";
import UnauthorizedPage from "./pages/unauthorized-page";
import BarcodeScannerPage from "./pages/barcode-scanner-page";
import CameraPage from "./pages/camera-page";
import GalleryPage from "./pages/gallery-page";
import ImagePage from "./pages/image-page";
import QrCodeGeneratorPage from "./pages/qrcode-generator-page";

export interface AppRoute
{
	allowedRoles: UserRoleName[];
	children: ReactNode;
	exact: boolean;
	icon: string;
	path: string;
	title: string;
	userNavigatable: boolean;
}

export const APP_ROUTES: AppRoute[] = [
	{
		allowedRoles: [UserRoleName.Basic,UserRoleName.Admin],
		children: (
			<Page name="Home" />
		),
		exact: true,
		icon: home,
		path: "/home",
		title: "Home",
		userNavigatable: true
	},
	{
		allowedRoles: [UserRoleName.Basic],
		children: <TopicsPage/>,
		exact: true,
		icon: chatbubble,
		path: "/topics",
		title: "Topics",
		userNavigatable: true
	},
	{
		allowedRoles: [UserRoleName.Admin],
		children: <PushNotificationsPage/>,
		exact: true,
		icon: cloud,
		path: "/push-notifications",
		title: "Push notifications",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <UserInfoPage/>,
		exact: true,
		icon: person,
		path: "/user-info",
		title: "User info",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <BarcodeScannerPage/>,
		exact: true,
		icon: barcode,
		path: "/barcode-scanner",
		title: "Barcode scanner",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <QrCodeGeneratorPage/>,
		exact: true,
		icon: qrCode,
		path: "/qrcode-generator",
		title: "QR code generator",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <CameraPage/>,
		exact: true,
		icon: camera,
		path: "/camera",
		title: "Camera",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <GalleryPage/>,
		exact: true,
		icon: image,
		path: "/gallery",
		title: "Gallery",
		userNavigatable: true
	},
	{
		allowedRoles: [],
		children: <ImagePage/>,
		exact: true,
		icon: image,
		path: "/image",
		title: "",
		userNavigatable: false
	},
	{
		allowedRoles: [],
		children: <UnauthorizedPage/>,
		exact: true,
		icon: person,
		path: "/unauthorized",
		title: "",
		userNavigatable: false
	}
];

