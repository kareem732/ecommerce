import { Pipe, PipeTransform } from '@angular/core';
import { HighlightSegment, highlightSegments } from '../utils/text-search';

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
  transform(text: string, term: string): HighlightSegment[] {
    return highlightSegments(text, term);
  }
}
