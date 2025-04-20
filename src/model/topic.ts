export interface Topic
{
	id: string;
	name: string;
	subscribed: boolean;
}

export const TOPICS = [
	{ id: "sports", name: "Deportes", subscribed: false },
	{ id: "challenges", name: "Nuevos Retos", subscribed: false },
];
