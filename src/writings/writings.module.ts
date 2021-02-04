import {Module} from '@nestjs/common';
import {
  AuthorWritesResolver,
  BookWritedByResolver,
  WritingsResolver,
} from './writings.resolver';
import {WritingsService} from './writings.service';

@Module({
  imports: [],
  providers: [
    WritingsService,
    WritingsResolver,
    AuthorWritesResolver,
    BookWritedByResolver,
  ],
  exports: [WritingsService],
})
export class WritingsModule {}
