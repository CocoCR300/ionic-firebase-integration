export function getFilenameFromDate(extension: string): string
{
	const date = new Date();

	const year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
	const month = new Intl.DateTimeFormat("en", { month: "2-digit" }).format(date);
	const day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
	const hour = new Intl.DateTimeFormat("en", { hour: "2-digit", hour12: false }).format(date);
	const minute = new Intl.DateTimeFormat("en", { minute: "2-digit" }).format(date);
	const second = new Intl.DateTimeFormat("en", { second: "2-digit" }).format(date);

	const filename = `${year}${month}${day}_${hour}${minute}${second}.${extension}`;
	return filename;
}
