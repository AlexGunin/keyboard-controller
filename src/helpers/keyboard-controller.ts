import { KeyChecker } from "./key-checker";
import { BaseKeyboardController } from "./base-keyboard-controller";
import { Options, SubscribeOptions, Element } from "../types";

export class KeyboardController extends BaseKeyboardController {
  protected parent: Element;

  public constructor(
    protected readonly options?: Options,
    protected readonly keyChecker = new KeyChecker()
  ) {
    super(keyChecker);
    this.parent = options?.element ?? window;
    this.init();
  }

  public clear = () => {
    this.parent.removeEventListener("keydown", this.handleKeydown);
    this.parent.removeEventListener("keyup", this.handleKeyup);
    this.parent.removeEventListener("blur", this.handleBlur);
    this.pressedKeys.clear();
    this.sequence = [];
  };

  public init = () => {
    this.parent.addEventListener("keydown", this.handleKeydown);
    this.parent.addEventListener("keyup", this.handleKeyup);
    this.parent.addEventListener("blur", this.handleBlur);
  };

  public left = (cb: Function, options?: SubscribeOptions) =>
    this.subscribe("left", cb, options);

  public right = (cb: Function, options?: SubscribeOptions) =>
    this.subscribe("right", cb, options);

  public up = (cb: Function, options?: SubscribeOptions) =>
    this.subscribe("up", cb, options);

  public down = (cb: Function, options?: SubscribeOptions) =>
    this.subscribe("down", cb, options);

  public subscribe = (
    shortcut: string,
    cb: Function,
    options?: SubscribeOptions
  ) => {
    const [pressed, sequence] = this.keyChecker.parseShortcut(shortcut);

    const preparedShortcut = this.prepareShortcut(pressed, sequence);

    this.handleMaxSize(pressed.length, sequence.length);
    const subscription = this.addSubscription(preparedShortcut, cb, options);

    return this.createUnsubscribe(subscription, preparedShortcut);
  };
}
