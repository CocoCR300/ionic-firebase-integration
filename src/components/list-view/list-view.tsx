import { ReactNode, forwardRef } from "react";
import { GridComponents, VirtuosoGrid } from "react-virtuoso";

import "./list-view.css";

export type ItemTemplateFn<T> = (index: number, item: T) => ReactNode;

export interface ListViewData<T>
{
	items: T[];
	itemTemplate: ItemTemplateFn<T>;
}

export function ListView<T>({ items, itemTemplate }: ListViewData<T>)
{
	const components: GridComponents = {
		List: forwardRef(({ children, style, ...props }, ref) => (
			<div	ref={ref}
					style={style}
					{...props}>
				{children}
			</div>
		)),
		Item: ({ children, ...props }) => (
			<div {...props}>
				{children}
			</div>
		)
	};
	return (
		<VirtuosoGrid
			components={components}
			itemClassName="app-virtuoso-item"
			listClassName="app-virtuoso-grid"
			totalCount={items.length}
			itemContent={(index) => {
				const product = items[index];

				return itemTemplate(index, product);
			}
		}/>
	);
}
