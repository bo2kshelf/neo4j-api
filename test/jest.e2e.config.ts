import type {Config} from '@jest/types';
import base from './jest.base.config';

const config: Config.InitialOptions = {
  ...base,
  testMatch: ['<rootDir>/**/test/e2e/*.test.ts'],
};
export default config;
