import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'trustHtml',
})
export class BypassHtmlSecurity implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) { }

  transform(html: any) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }


}
