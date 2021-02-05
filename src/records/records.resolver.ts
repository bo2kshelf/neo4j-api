import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AccountEntity} from '../accounts/account.entity';
import {AccountHaveBooksArgs} from './dto/account-have-books.dto';
import {AccountReadBooksArgs} from './dto/account-read-books.dto';
import {AccountReadingBooksArgs} from './dto/account-reading-books.dto';
import {AccountWishBooksArgs} from './dto/account-wish-books.dto';
import {CreateReadRecord} from './dto/create-read-record.dto';
import {SwitchHaveRecordArgs} from './dto/switch-have-record.dto';
import {SwitchReadingRecordArgs} from './dto/switch-reading-record.dto';
import {SwitchWishReadRecordArgs} from './dto/switch-wish-read-record.dto';
import {
  HaveRecordEntity,
  ReadingRecordEntity,
  ReadRecordEntity,
  WishReadRecordEntity,
} from './record.entity';
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

@Resolver(() => WishReadRecordEntity)
export class WishReadRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => WishReadRecordEntity)
  switchWishReadRecord(
    @Args({type: () => SwitchWishReadRecordArgs})
    {bookId, accountId, wish}: SwitchWishReadRecordArgs,
  ) {
    return wish
      ? this.recordsService.createWishReadRecord({bookId, accountId})
      : this.recordsService.deleteWishReadRecord({bookId, accountId});
  }
}

@Resolver(() => HaveRecordEntity)
export class HaveRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => HaveRecordEntity)
  switchHaveRecord(
    @Args({type: () => SwitchHaveRecordArgs})
    {bookId, accountId, have}: SwitchHaveRecordArgs,
  ) {
    return have
      ? this.recordsService.createHaveRecordEntity({bookId, accountId})
      : this.recordsService.deleteHaveRecordEntity({bookId, accountId});
  }
}

@Resolver(() => AccountEntity)
export class AccountRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @ResolveField(() => [ReadRecordEntity])
  async readBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadBooksArgs}) args: AccountReadBooksArgs,
  ): Promise<ReadRecordEntity[]> {
    return this.recordsService.getReadRecordsFromAccount(account, args);
  }

  @ResolveField(() => [ReadingRecordEntity])
  async readingBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadingBooksArgs}) args: AccountReadingBooksArgs,
  ): Promise<ReadingRecordEntity[]> {
    return this.recordsService.getReadingRecordsFromAccount(account, args);
  }

  @ResolveField(() => [WishReadRecordEntity])
  async wishReadBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountWishBooksArgs}) args: AccountWishBooksArgs,
  ): Promise<WishReadRecordEntity[]> {
    return this.recordsService.getWishReadRecordEntity(account, args);
  }

  @ResolveField(() => [HaveRecordEntity])
  async haveBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountHaveBooksArgs}) args: AccountHaveBooksArgs,
  ): Promise<HaveRecordEntity[]> {
    return this.recordsService.getHaveRecordEntity(account, args);
  }
}
