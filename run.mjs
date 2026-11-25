import { isAbsolute, join } from 'node:path';
import { list, report, selectors, value } from '@cairul/plugin-kit/runner';
import { junit } from '@cairul/plugin-kit/reports';

export default {
  select: selectors({ executable: value, suites: list, cases: list, exclude: list }, ['suites', 'cases', 'exclude']),
  build({ executable, suites, cases, exclude }, temp, { command }) {
    if (executable && command) throw new Error('Choose a test executable or a configured command.');
    if ([...(suites ?? []), ...(cases ?? []), ...(exclude ?? [])].some((value) => /[:-]/.test(value)))
      throw new Error('GoogleTest patterns cannot contain filter delimiters.');
    if (suites && cases) throw new Error('Use suite patterns or fully qualified case patterns.');
    const include = (cases ?? suites?.map((name) => name + '.*'))?.join(':') ?? '*';
    return {
      command: executable ? [isAbsolute(executable) ? executable : './' + executable] : undefined,
      args: [
        '--gtest_output=xml:' + join(temp, 'result.xml'),
        '--gtest_filter=' + include + (exclude ? '-' + exclude.join(':') : ''),
      ],
      read: report('result.xml', junit),
    };
  },
};
