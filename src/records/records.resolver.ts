import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AccountEntity} from '../accounts/account.entity';
import {AccountReadingArgs} from './dto/account-reading.dto';
import {AccountReadsArgs} from './dto/account-reads.dto';
import {CreateReadRecord} from './dto/create-read-record.dto';
import {SwitchReadingRecordArgs} from './dto/switch-reading-record.dto';
import {ReadingRecordEntity, ReadRecordEntity} from './record.entity';
import {RecordsService} from './records.service';

@Resolver(() => ReadRecordEntity)
export class ReadRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => ReadRecordEntity)
  createReadRecord(
    @Args({type: () => CreateReadRecord})
    {bookId, accountId, date}: CreateReadRecord,
  ) {
    return this.recordsService.createReadRecord({bookId, accountId}, {date});
  }
}

@Resolver(() => ReadingRecordEntity)
export class ReadingRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => ReadingRecordEntity)
  switchReadingRecord(
    @Args({type: () => SwitchReadingRecordArgs})
    {bookId, accountId, reading}: SwitchReadingRecordArgs,
  ) {
    return reading
      ? this.recordsService.createReadingRecord({bookId, accountId})
      : this.recordsService.deleteReadingRecord({bookId, accountId});
  }
}

@Resolver(() => AccountEntity)
export class AccountRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @ResolveField(() => [ReadRecordEntity])
  async reads(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadsArgs}) args: AccountReadsArgs,
  ): Promise<ReadRecordEntity[]> {
    return this.recordsService.getReadRecordsFromAccount(account, args);
  }

  @ResolveField(() => [ReadingRecordEntity])
  async reading(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadsArgs}) args: AccountReadingArgs,
  ): Promise<ReadingRecordEntity[]> {
    return this.recordsService.getReadingRecordsFromAccount(account, args);
  }
}
