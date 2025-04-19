import { useParams } from "react-router";
import ExploreContainer from "../components/ExploreContainer";

import "./Page.css";
import { PageWrapper } from "../components/page-wrapper";

export function Page()
{
	const { name } = useParams<{ name: string; }>();

	return (
		<PageWrapper title={name}>
			<ExploreContainer name={name} />
		</PageWrapper>
	);
};

export default Page;
