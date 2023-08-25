interface Node {
    getAttribute(attr: string): string;
    setAttribute(attr: string): string;
}

interface PassiveEventObj {
    capture: boolean;
    passive: boolean;
}