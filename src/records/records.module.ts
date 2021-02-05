import {Module} from '@nestjs/common';
import {
  AccountRecordsResolver,
  HaveRecordsResolver,
  ReadingRecordsResolver,
  ReadRecordsResolver,
  WishReadRecordsResolver,
} from './records.resolver';
import {RecordsService} from './records.service';

@Module({
  imports: [],
  providers: [
    RecordsService,
    ReadingRecordsResolver,
    ReadRecordsResolver,
    HaveRecordsResolver,
    WishReadRecordsResolver,
    AccountRecordsResolver,
  ],
  exports: [RecordsService],
})
export class RecordsModule {}
