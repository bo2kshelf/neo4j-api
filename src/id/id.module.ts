import {Module} from '@nestjs/common';
import {IDService} from './id.service';

@Module({
  imports: [],
  providers: [IDService],
  exports: [IDService],
})
export class IDModule {}
