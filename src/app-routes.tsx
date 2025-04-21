import { ReactNode } from "react";
import { UserRoleName } from "./model/user-role";
import PushNotificationsPage from "./pages/push-notifications";
import UserInfoPage from "./pages/user-info-page";
import TopicsPage from "./pages/topics-page";
import { chatbubble, cloud, home, person } from "ionicons/icons";
import Page from "./pages/Page";

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
		children: <UserInfoPage/>,
		exact: true,
		icon: person,
		path: "/unauthorized",
		title: "",
		userNavigatable: false
	}
];

