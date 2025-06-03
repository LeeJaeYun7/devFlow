import { Injectable } from '@nestjs/common';
import { Parser } from 'htmlparser2';
@Injectable()
export class ParserService {
  public createParser(cb: (content: string) => void) {
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
}
