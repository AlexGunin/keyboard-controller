import type { KeyChecker as IKeyChecker } from "../types";

export class KeyChecker implements IKeyChecker {
  constructor(
    public readonly pressedSign = "+",
    public readonly sequenceSign = "-"
  ) {}

  public getKey = (code: string) => {
    // TODO: переделать
    if (this.isLetter(code)) return this.getLetter(code);
    if (this.isAlt(code)) return this.alt;
    if (this.isArrow(code)) return this.getArrow(code);
    if (this.isControl(code)) return this.ctrl;
    if (this.isShift(code)) return this.shift;
    if (this.isMeta(code)) return this.meta;
    if (this.isDigit(code)) return this.getDigit(code);

    return code.toLowerCase();
  };

  public isComplexShortcut = (str: string) => !!str.match(/[+-]/gi);

  public parseShortcut = (
    shortcut: string,
    pressedSign = this.pressedSign,
    sequenceSign = this.sequenceSign
  ): [pressed: string[], sequence: string[]] => {
    if (!this.isComplexShortcut(shortcut))
      return [[], [shortcut.toLowerCase()]];

    const isPressedSignOrSequenceSign = (str: string) =>
      str === pressedSign || str === sequenceSign;
    const isBothIsSign = (str1: string, str2: string) =>
      isPressedSignOrSequenceSign(str1) && isPressedSignOrSequenceSign(str2);

    const pressed: string[] = [];
    const sequence: string[] = [];

    let lastSign = null;
    let i = 0;
    let j = 0;

    while (i < shortcut.length) {
      const prev = shortcut[j];
      const current = shortcut[i];

      if (i - j < 2 && isBothIsSign(current, prev)) {
        j++;
        i++;
        continue;
      }

      if (isPressedSignOrSequenceSign(current)) {
        const startIndex = isPressedSignOrSequenceSign(prev) ? j + 1 : j;
        const arr = (lastSign ?? current) === "+" ? pressed : sequence;

        arr.push(shortcut.slice(startIndex, i));
        lastSign = current;

        j = i;
        i++;
        continue;
      }

      i++;
    }

    if (lastSign && !isBothIsSign(shortcut[i], shortcut[j])) {
      const arr = lastSign === "+" ? pressed : sequence;
      arr.push(shortcut.slice(j + 1, i));
    }

    return [pressed, sequence];
  };

  protected alt = "alt";

  protected ctrl = "ctrl";

  protected shift = "shift";

  protected meta = "meta";

  protected isLetter = (code: string) => {
    return code.startsWith("Key");
  };

  protected getLetter = (code: string) => {
    return code.replace("Key", "").toLowerCase();
  };

  protected isDigit = (code: string) =>
    code.startsWith("Digit") || code.startsWith("Numpad");

  protected getDigit = (code: string) => code.replace(/Digit|Numpad/, "");

  protected isArrow = (code: string) =>
    code === "ArrowUp" ||
    code === "ArrowRight" ||
    code === "ArrowDown" ||
    code === "ArrowLeft";

  protected getArrow = (code: string) =>
    code.replace("Arrow", "").toLowerCase();

  protected isControl = (code: string) =>
    code === "ControlLeft" || code === "ControlRight";

  protected isShift = (code: string) =>
    code === "ShiftLeft" || code === "ShiftRight";

  protected isAlt = (code: string) => code === "AltLeft" || code === "AltRight";

  protected isMeta = (code: string) =>
    code === "MetaLeft" || code === "MetaRight";
}
