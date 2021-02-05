import {Module} from '@nestjs/common';
import {
  AccountRecordsResolver,
  ReadingRecordsResolver,
  ReadRecordsResolver,
} from './records.resolver';
import {RecordsService} from './records.service';

@Module({
  imports: [],
  providers: [
    RecordsService,
    ReadingRecordsResolver,
    ReadRecordsResolver,
    AccountRecordsResolver,
  ],
  exports: [RecordsService],
})
export class RecordsModule {}
