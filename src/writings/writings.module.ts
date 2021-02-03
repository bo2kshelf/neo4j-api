import {Module} from '@nestjs/common';
import {WritingsResolver} from './writings.resolver';
import {WritingsService} from './writings.service';

@Module({
  imports: [],
  providers: [WritingsResolver, WritingsService],
  exports: [WritingsService],
})
export class WritingsModule {}
