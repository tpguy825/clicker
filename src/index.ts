import { type MouseEvent, type TouchEvent, type MutableRefObject, useCallback, useRef, useState } from "react";

type LongPress<Element extends HTMLElement> = {
	onMouseDown: (event: MouseEvent<Element> | TouchEvent<Element>) => void;
	onTouchStart: (event: MouseEvent<Element> | TouchEvent<Element>) => void;
	onMouseUp: (event: MouseEvent<Element> | TouchEvent<Element>) => void;
	onMouseLeave: (event: MouseEvent<Element> | TouchEvent<Element>) => void;
	onTouchEnd: (event: MouseEvent<Element> | TouchEvent<Element>) => void;
};

/**
 * @template Element Used to specify what type of element the event listeners will be attached to.
 * @param onLongPress The function to be called when the element is clicked and held for the time specified in `options.delay`.
 * @param onClick The function to be called when the element is clicked.
 */
export function useLongPress<Element extends HTMLElement>(
	onLongPress: (e: MouseEvent<Element> | TouchEvent<Element>) => void,
	onClick?: (e: MouseEvent<Element> | TouchEvent<Element>) => void,
	options?: {
		shouldPreventDefault?: boolean;
		delay?: number;
	},
): LongPress<Element> {
	const { shouldPreventDefault = true, delay = 300 } = options || {};
	const [longPressTriggered, setLongPressTriggered] = useState(false);
	const timeout: MutableRefObject<number | NodeJS.Timeout | undefined> = useRef();
	const target: MutableRefObject<Element | undefined> = useRef();

	const start = useCallback(
		(event: MouseEvent<Element> | TouchEvent<Element>) => {
			if (shouldPreventDefault && event.target) {
				event.target.addEventListener("touchend", preventDefault, {
					passive: false,
				});
				target.current = event.target as Element;
			}
			timeout.current = setTimeout(() => {
				onLongPress(event);
				setLongPressTriggered(true);
			}, delay);
		},
		[onLongPress, delay, shouldPreventDefault],
	);

	const clear = useCallback(
		(event: MouseEvent<Element> | TouchEvent<Element>, shouldTriggerClick = true) => {
			if (timeout.current) clearTimeout(timeout.current);
			if (shouldTriggerClick && !longPressTriggered && onClick) onClick(event);
			setLongPressTriggered(false);
			if (shouldPreventDefault && target.current) {
				target.current.removeEventListener("touchend", preventDefault);
			}
		},
		[shouldPreventDefault, onClick, longPressTriggered],
	);

	const preventDefault: EventListener = (
		event: Event & {
			touches?: TouchList;
		},
	) => {
		if (!("touches" in event) || event.touches === undefined) return;

		if (event.touches.length < 2 && event.preventDefault) {
			event.preventDefault();
		}
	};

	return {
		onMouseDown: start,
		onTouchStart: start,
		onMouseUp: clear,
		onMouseLeave: (event: MouseEvent<Element> | TouchEvent<Element>) => clear(event, false),
		onTouchEnd: clear,
	};
}
/**
 * @param {number} time The time in milliseconds that the user must hover for.
 */
export function useLongHover(time: number): [
	isHoveredForTime: boolean,
	handlers: {
		onMouseEnter: (event: MouseEvent) => void;
		onMouseLeave: (event: MouseEvent) => void;
	},
] {
	const [isHoveredForTime, setIsHoveredForTime] = useState(false);
	const [timeout, changeTimeout] = useState<NodeJS.Timeout | number | null>(null);
	const handlers = {
		onMouseLeave: () => {
			if (timeout) {
				clearTimeout(timeout);
				changeTimeout(null);
			}
			setIsHoveredForTime(false);
		},
		onMouseEnter: () => changeTimeout(setTimeout(() => setIsHoveredForTime(true), time)),
	};
	return [isHoveredForTime, handlers];
}