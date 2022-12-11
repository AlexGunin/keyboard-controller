import { KeyChecker } from "./key-checker";
import { SubscribeOptions, Subscription, Subscriptions } from "../types";

export abstract class BaseKeyboardController {
  constructor(protected readonly keyChecker: KeyChecker) {}

  protected lastKeyDown?: string = undefined;

  protected handleKeydown = (e: KeyboardEvent) => {
    if (!this.hasEmptyPressedSpace()) return;

    this.pressedKeys.add(this.keyChecker.getKey(e.code));

    const pressedSubstring = this.shortcutTransform(
      Array.from(this.pressedKeys),
      this.keyChecker.pressedSign
    );

    this.emit(this.subscriptions.get(pressedSubstring));
    this.lastKeyDown = pressedSubstring;
  };

  protected handleKeyup = (e: KeyboardEvent) => {
    const key = this.keyChecker.getKey(e.code);

    this.pressedKeys.delete(key);

    this.handleSequence(key);
    this.notify();
  };

  protected handleBlur = () => {
    this.pressedKeys.clear();
  };

  protected pressedKeys: Set<string> = new Set();

  // TODO: заменить на свою реализацию очереди
  protected sequence: string[] = [];

  protected subscriptions: Subscriptions = new Map();

  protected pressedKeysMaxSize = 2;

  protected sequenceKeysMaxSize = 2;

  protected hasEmptyPressedSpace = () =>
    this.pressedKeysMaxSize > this.pressedKeys.size;

  protected hasEmptySequenceSpace = () =>
    this.sequenceKeysMaxSize > this.sequence.length;

  protected handleSequence = (key: string) => {
    if (!this.hasEmptySequenceSpace()) {
      const key = this.sequence.shift();
      while (key && key === this.sequence[0]) {
        this.sequence.shift();
      }
    }
    this.sequence.push(key);
  };

  protected notify = () => {
    const sequenceSubstrings = this.getAllSequenceSubstrings();
    const pressedSubstring = this.shortcutTransform(
      Array.from(this.pressedKeys),
      this.keyChecker.pressedSign
    );

    sequenceSubstrings.forEach((substring) => {
      const singleSequenceSubscriptions = this.subscriptions.get(substring);
      if (substring !== this.lastKeyDown)
        this.emit(singleSequenceSubscriptions);

      if (pressedSubstring) {
        const multiTypeSubscriptions = this.subscriptions.get(
          this.mergePressedAndSequenceShortcut(pressedSubstring, substring)
        );

        this.emit(multiTypeSubscriptions);
      }
    });
  };

  protected emit = (subscriptions?: Subscription | Subscription[]) => {
    if (!subscriptions) return;

    const preparedSubscriptions = Array.isArray(subscriptions)
      ? subscriptions
      : [subscriptions];

    preparedSubscriptions.forEach(({ handler }) => {
      handler();
    });
  };

  protected getAllSequenceSubstrings = (): string[] => {
    const result = [];

    let start = 0;

    while (start <= this.sequence.length - 1) {
      result.push(
        this.sequence.slice(start).join(this.keyChecker.sequenceSign)
      );
      start++;
    }

    return result;
  };

  protected handleMaxSize = (pressedSize: number, sequenceSize: number) => {
    this.pressedKeysMaxSize = Math.max(this.pressedKeysMaxSize, pressedSize);
    this.sequenceKeysMaxSize = Math.max(this.sequenceKeysMaxSize, sequenceSize);
  };

  protected addSubscription = (
    shortcut: string,
    cb: Function,
    options?: SubscribeOptions
  ) => {
    const currentSubscriptions = this.subscriptions.get(shortcut);
    const subscription = this.wrapSubscription(cb, options);

    const containerForSubscription = !currentSubscriptions
      ? [subscription]
      : [...currentSubscriptions, subscription];

    this.subscriptions.set(shortcut, containerForSubscription);

    return subscription;
  };

  protected createUnsubscribe =
    (subscription: Subscription, shortcut: string) => () => {
      const subscriptions = this.subscriptions.get(shortcut);

      if (!subscriptions) return;

      this.subscriptions.set(
        shortcut,
        subscriptions.filter((item) => item !== subscription)
      );
    };

  protected wrapSubscription = (cb: Function, options?: SubscribeOptions) => ({
    handler: cb,
    options,
  });

  // TODO: придумать иной подход к формированию строки, возможно сортировать на этапе разделения на pressed/sequence
  protected shortcutTransform = (arr: string[], sign: string) =>
    arr.length
      ? arr
          .map((key) => key.toLowerCase())
          .sort((a, b) => a.localeCompare(b))
          .join(sign)
      : "";

  protected mergePressedAndSequenceShortcut = (
    pressedShortcut: string,
    sequenceShortcut: string
  ) => {
    if (!pressedShortcut) return sequenceShortcut;
    if (!sequenceShortcut) return pressedShortcut;

    return `${pressedShortcut}${this.keyChecker.sequenceSign}${sequenceShortcut}`;
  };

  protected prepareShortcut = (pressed: string[], sequence: string[]) => {
    const pressedShortcut = this.shortcutTransform(
      pressed,
      this.keyChecker.pressedSign
    );
    const sequenceShortcut = this.shortcutTransform(
      sequence,
      this.keyChecker.sequenceSign
    );

    return this.mergePressedAndSequenceShortcut(
      pressedShortcut,
      sequenceShortcut
    );
  };
}
