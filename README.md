# clicker

Mouse event helper library for React

## Examples

```jsx
import { useLongPress, useLongHover } from "@tpguy825/clicker";
// or for preact
import { useLongPress, useLongHover } from "@tpguy825/clicker/preact";

function App() {
    const handlers = useLongPress(
        () => console.log("long press"),
        () => console.log("short press (click)"),
        { shouldPreventDefault: false, interval: 100 /* 0.1s */ },
    );

    return <button {...handlers}>Click me (then check the console)</button>;
}

function App() {
    const [hoveredForTime, handlers] = useLongHover(500);

    return <button {...handlers}>{hoveredForTime ? "You hovered for 0.5s!" : "Hover over me!"}</button>;
}
```
