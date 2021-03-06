import {Injectable} from '@angular/core';
import {WordService} from './word.service';

@Injectable({
  providedIn: 'root'
})
export class BookParserService {
  private knownTokens = {};

  constructor(private wordService: WordService) {
    // Building a map for better performance
    this.wordService.getWords().forEach(word => this.knownTokens[word] = word);
  }

  parse(text: string): {
    tokens: string[],
    words: any,
    occurrences: any
  } {
    const tokens: string[] = [];
    const words = {};

    for (const token of this.splitIntoTokens(text)) {
      if (words.hasOwnProperty(token) || !this.hasAnyLetter(token)) {
        tokens.push(token);
      } else {
        const reducedToken = this.reduceToken(token);
        if (reducedToken) {
          words[token] = reducedToken;
          tokens.push(token);
        } else {
          for (const subToken of this.splitIntoSubTokens(token)) {
            if (!words.hasOwnProperty(subToken) && this.hasAnyLetter(subToken)) {
              words[subToken] = this.reduceToKnownToken(subToken) || subToken;
            }
            tokens.push(subToken);
          }
        }
      }
    }

    const occurrences = this.gatherWordOccurrences(tokens, words);
    return {
      tokens: tokens,
      words: words,
      occurrences: occurrences
    };
  }

  splitIntoLines(tokens: string[], lineWidth: number): string[][] {
    const lines: string[][] = [];
    let line: string[] = [];

    for (const token of tokens) {
      if (token === '\n') {
        line.push(token);
        lines.push(line);
        line = [];
      } else if (this.sumLength(...line, token) > lineWidth) {
        line.push('\n'); // to force line breaks on page
        lines.push(line);
        line = token === ' ' ? [] : [token]; // just one space not to mess up paragraphs, titles and so on
      } else {
        line.push(token);
      }
    }

    if (line.length > 0) {
      lines.push(line);
    }

    return lines;
  }

  private sumLength(...tokens: string[]): number {
    return tokens.reduce((length, token) => length + token.length, 0);
  }

  private gatherWordOccurrences(tokens: string[], words: any): any {
    const wordOccurrences = {};
    for (const token of tokens) {
      if (words.hasOwnProperty(token)) {
        const word = words[token];
        wordOccurrences[word] = (wordOccurrences[word] || 0) + 1;
      }
    }
    return wordOccurrences;
  }

  private reduceToken(token: string): string {
    let knownToken = this.reduceToKnownToken(token);
    if (knownToken) {
      return knownToken;
    }

    if (this.hasOnlyLetters(token)) {
      return token.toLowerCase();
    }

    if (this.hasAnyDash(token)) {
      knownToken = this.reduceToKnownToken(this.removeDashes(token));
      if (knownToken) {
        return knownToken;
      }
    }

    return null;
  }

  private reduceToKnownToken(token: string): string {
    if (this.isKnown(token)) {
      return token;
    }

    token = token.toLowerCase();
    if (this.isKnown(token)) {
      return token;
    }

    token = token.charAt(0).toUpperCase() + token.slice(1);
    if (this.isKnown(token)) {
      return token;
    }

    token = token.toUpperCase();
    if (this.isKnown(token)) {
      return token;
    }

    return null;
  }

  private isKnown(token: string): boolean {
    // return this.knownTokens.includes(token);
    return this.knownTokens.hasOwnProperty(token);
  }

  private hasAnyLetter(str: string): boolean {
    return /[a-z]/i.test(str);
  }

  private hasAnyDash(str: string): boolean {
    return /-/.test(str);
  }

  private removeDashes(str: string): string {
    return str.replace(/-/g, '');
  }


  private hasOnlyLetters(str: string): boolean {
    return !/[^a-z]/i.test(str);
  }

  private splitIntoTokens(text: string): string[] {
    const tokens = [];
    // each new line character is treated as a separate token to ease pagination
    const p = /([a-z'\-]+|[^a-z'\-\n]+|\n)/gi;
    let m;
    while (m = p.exec(text)) {
      tokens.push(m[1]);
    }
    return tokens;
  }

  private splitIntoSubTokens(text: string): string[] {
    const tokens = [];
    const p = /([a-z]+|[^a-z]+)/gi;
    let m;
    while (m = p.exec(text)) {
      tokens.push(m[1]);
    }
    return tokens;
  }
}
