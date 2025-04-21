import ExploreContainer from "../components/ExploreContainer";

import "./Page.css";
import { PageWrapper } from "../components/page-wrapper";

interface PageData
{
	name: string;
}

export function Page({ name }: PageData)
{
	return (
		<PageWrapper title={name}>
			<ExploreContainer name={name} />
		</PageWrapper>
	);
};

export default Page;
