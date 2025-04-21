import { Redirect, Route, RouteProps } from "react-router-dom";
import { UserRoleName } from "../model/user-role";
import { useContext } from "react";
import { UserSessionContext } from "./user-session-provider";

interface ProtectedRouteData extends RouteProps
{
	allowedRoles: Array<UserRoleName>;
}

export default function ProtectedRoute({ allowedRoles, ...props }: ProtectedRouteData)
{
	const userSession = useContext(UserSessionContext);
	const user = userSession.user;

	if (!user) {
		return <Redirect to="/login" />
	}

	const userRoles = user.roles;
	if (!userRoles.some(userRole => allowedRoles.find(allowedRole => userRole == allowedRole))) {
		return <Redirect to="/unathorized" />
	}

	console.log("User is authorized");
	return <Route {...props} />
}
