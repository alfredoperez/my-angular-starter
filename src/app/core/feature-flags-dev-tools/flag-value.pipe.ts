import { Pipe, PipeTransform } from '@angular/core';
import { FeatureFlag } from '@my/shared/feature-flags/feature-flags.models';

@Pipe({
  name: 'flagValue',
  standalone: true,
})
export class FlagValuePipe implements PipeTransform {
  transform(name: string, flags: Array<FeatureFlag>): boolean {
    const originalFlag = flags.find((flag) => flag.name === name);
    return originalFlag ? originalFlag.value : false;
  }
}
