import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ComparatorService, MatchResult} from './comparator.service';
import {RandomService} from './random.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.css'],
  animations: [
    trigger('hintState', [
      state('1', style({opacity: 0.25})),
      state('0', style({opacity: 0})),
      transition('0 => 1', animate('250ms')),
      transition('1 => 0', animate('750ms')),
    ])
  ]
})
export class StudyComponent implements OnInit {
  @ViewChild('input') input: ElementRef;
  sequenceModes = {
    'uniform': 'Uniform',
    'ordered': 'Ordered',
    'random': 'Random'
  };

  translationMap: any;
  translationKeys: string[];
  sequenceIndex: number;

  randomIndexes: number[];
  history: number[];
  inputTranslation: string;
  sequenceMode = 'uniform';
  resultType: string; // pass, check
  matchResult: MatchResult;
  hintVisible = false;

  // hintState = 'off';

  constructor(private randomService: RandomService,
              private comparatorService: ComparatorService) {
  }

  ngOnInit() {
    this.translationMap = {
      'привет': 'hello',
      'пока': 'bye'
    };
    this.translationKeys = Object.keys(this.translationMap);
    this.sequenceIndex = -1;
    this.history = [];
    this.next();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        event.shiftKey ? this.back() : this.next();
        break;
      case 'Enter':
        event.preventDefault();
        event.ctrlKey ? this.pass() : this.check();
        break;
      case ' ':
        if (event.ctrlKey) {
          event.preventDefault();
          this.showHint();
        }
        break;
    }
  }

  next(): void {
    this.sequenceIndex = (this.sequenceIndex + 1) % this.translationKeys.length;
    let currentIndex;
    if (this.sequenceMode === 'random') {
      currentIndex = this.randomService.randomInt(this.translationKeys.length);
    } else if (this.sequenceMode === 'ordered') {
      currentIndex = this.sequenceIndex;
    } else if (this.sequenceMode === 'uniform') {
      if (this.sequenceIndex === 0 || !this.randomIndexes) {
        this.randomIndexes = this.randomService.randomIntArray(this.translationKeys.length);
      }
      currentIndex = this.randomIndexes[this.sequenceIndex];
    }

    this.history.push(currentIndex);
    this.resetResult();
  }

  back(): void {
    if (this.history.length > 1) {
      this.sequenceIndex = (this.sequenceIndex - 1 + this.translationKeys.length) % this.translationKeys.length;
      this.history.pop();
      this.resetResult();
    }
  }

  check(): void {
    this.resultType = 'check';
    this.matchResult = this.comparatorService.compare(this.inputTranslation || '', this.getTranslationValue());
    this.focusInput();
  }

  pass(): void {
    this.resultType = 'pass';
    this.focusInput();
  }

  showHint(): void {
    this.hintVisible = true;

    // TODO: consider resultType hint? maybe not...
    // $("#hint").css({opacity: 0.25}).html($("#required").val()).fadeTo(1000, 0);
    // $("#actual").focus();
    // this.hintVisible = true;
    // setTimeout(() => {
    //   this.hintVisible = false;
    // }, 200);
    this.focusInput();
  }

  hideHint(): void {
    this.hintVisible = false;
  }

  getTranslationKey(): string {
    return this.translationKeys[this.getCurrentIndex()];
  }

  getTranslationValue(): string {
    return this.translationMap[this.getTranslationKey()];
  }

  isResult(resultType: string): boolean {
    return this.resultType === resultType;
  }

  isHintVisible(): boolean {
    return this.hintVisible;
  }

  getCounter(): number {
    return this.history.length;
  }

  private getCurrentIndex(): number {
    return this.history[this.history.length - 1];
  }

  private resetResult(): void {
    this.resultType = null;
    this.matchResult = null;
    this.inputTranslation = null;
    this.focusInput();
  }

  private focusInput() {
    this.input.nativeElement.focus();
  }
}
