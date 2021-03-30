import {Injectable} from '@nestjs/common';
import {customAlphabet} from 'nanoid';

@Injectable()
export class IDService {
  private readonly nanoid: ReturnType<typeof customAlphabet>;

  constructor() {
    this.nanoid = customAlphabet(
      '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz',
      16,
    );
  }

  generate(): string {
    return this.nanoid();
  }
}
