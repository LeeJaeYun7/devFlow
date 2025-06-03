import { Parser } from 'htmlparser2';

export class ParserService {
  private readonly parser: Parser;

  constructor(cb: (content: string) => void) {
    this.parser = this.createParser(cb);
  }

  private createParser(cb: (content: string) => void) {
    let isThinking = false;

    const parser = new Parser({
      onopentag: (node) => {
        if (node === 'thinking') {
          isThinking = true;
        }
      },
      onclosetag: (node) => {
        if (node === 'thinking') {
          isThinking = false;
        }
      },
      ontext: (text) => {
        if (!isThinking) {
          cb(text); // 그냥 text 그대로 전달
        }
      },
    });

    return parser;
  }

  public static createInstance(cb: (content: string) => void) {
    const parser = new ParserService(cb);
    return parser.parser;
  }
}
