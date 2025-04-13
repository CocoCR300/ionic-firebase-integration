export function delay(milliseconds: number)
{
	return new Promise((resolve, _) => setTimeout(resolve, milliseconds));
}

