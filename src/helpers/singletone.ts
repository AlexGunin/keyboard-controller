import { KeyboardController } from "../index";
import { Options } from "../types";
import { KeyChecker } from "./key-checker";

export class GlobalKeyboardController {
  public static instance?: KeyboardController;

  protected constructor() {}

  public static getInstance = () => {
    if (this.instance) return this.instance;

    this.instance = new KeyboardController();

    return;
  };

  public static init = (options?: Options, keyChecker = new KeyChecker()) => {
    this.instance = new KeyboardController(options, keyChecker);
  };
}
