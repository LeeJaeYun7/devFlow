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
          cb(text);
        }
      },
    });

    return parser;
  }
}
