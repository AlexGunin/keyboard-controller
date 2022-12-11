export interface Element {
  removeEventListener(
    type: "keyup" | "keydown" | "blur",
    listener: (event: KeyboardEvent) => any,
    options?: boolean | EventListenerOptions
  ): void;
  addEventListener(
    type: "keyup" | "keydown" | "blur",
    listener: (event: KeyboardEvent) => any,
    options?: boolean | EventListenerOptions
  ): void;
}

export interface Options {
  element: Element;
}

export interface SubscribeOptions {
  once?: boolean;
  condition: () => boolean;
}

export interface Subscription {
  handler: Function;
  options?: SubscribeOptions;
}

export type Subscriptions = Map<string, Subscription[]>;

export interface KeyChecker {
  getKey: (code: string) => string;
  isComplexShortcut: (str: string) => boolean;
  parseShortcut: (
    shortcut: string,
    pressedSign?: string,
    sequenceSign?: string
  ) => [pressed: string[], sequence: string[]];
}
