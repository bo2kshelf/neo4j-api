import {
  Args,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {AccountEntity} from '../accounts/account.entity';
import {AccountHaveBooksArgs} from './dto/account-have-books.dto';
import {AccountReadBooksArgs} from './dto/account-read-books.dto';
import {AccountReadingBooksArgs} from './dto/account-reading-books.dto';
import {AccountStackedBooksArgs} from './dto/account-stacked-books.dto';
import {AccountWishBooksArgs} from './dto/account-wish-books.dto';
import {CreateReadBookRecord} from './dto/create-read-book-record.dto';
import {SwitchHaveBookRecordArgs} from './dto/switch-have-book-record.dto';
import {SwitchReadingBookRecordArgs} from './dto/switch-reading-book-record.dto';
import {SwitchWishReadBookRecordArgs} from './dto/switch-wish-book-read-record.dto';
import {
  HaveBookRecordEntity,
  ReadBookRecordEntity,
  ReadingBookRecordEntity,
  StackedRecordEntity,
  WishReadBookRecordEntity,
} from './record.entity';
import {RecordsService} from './records.service';

@Resolver(() => ReadBookRecordEntity)
export class ReadRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => ReadBookRecordEntity)
  createReadRecord(
    @Args({type: () => CreateReadBookRecord})
    {bookId, accountId, date}: CreateReadBookRecord,
  ) {
    return this.recordsService.createReadRecord({bookId, accountId}, {date});
  }
}

@Resolver(() => ReadingBookRecordEntity)
export class ReadingRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => ReadingBookRecordEntity)
  switchReadingRecord(
    @Args({type: () => SwitchReadingBookRecordArgs})
    {bookId, accountId, reading}: SwitchReadingBookRecordArgs,
  ) {
    return reading
      ? this.recordsService.createReadingRecord({bookId, accountId})
      : this.recordsService.deleteReadingRecord({bookId, accountId});
  }
}

@Resolver(() => WishReadBookRecordEntity)
export class WishReadRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => WishReadBookRecordEntity)
  switchWishReadRecord(
    @Args({type: () => SwitchWishReadBookRecordArgs})
    {bookId, accountId, wish}: SwitchWishReadBookRecordArgs,
  ) {
    return wish
      ? this.recordsService.createWishReadRecord({bookId, accountId})
      : this.recordsService.deleteWishReadRecord({bookId, accountId});
  }
}

@Resolver(() => HaveBookRecordEntity)
export class HaveRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @Mutation(() => HaveBookRecordEntity)
  switchHaveRecord(
    @Args({type: () => SwitchHaveBookRecordArgs})
    {bookId, accountId, have}: SwitchHaveBookRecordArgs,
  ) {
    return have
      ? this.recordsService.createHaveRecordEntity({bookId, accountId})
      : this.recordsService.deleteHaveRecordEntity({bookId, accountId});
  }
}

@Resolver(() => AccountEntity)
export class AccountRecordsResolver {
  constructor(private readonly recordsService: RecordsService) {}

  @ResolveField(() => [ReadBookRecordEntity])
  async readBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadBooksArgs}) args: AccountReadBooksArgs,
  ): Promise<ReadBookRecordEntity[]> {
    return this.recordsService.getReadRecordsFromAccount(account, args);
  }

  @ResolveField(() => Int!)
  async countReadBooks(@Parent() account: AccountEntity): Promise<number[]> {
    return this.recordsService.countReadRecordFromAccount(account);
  }

  @ResolveField(() => [ReadingBookRecordEntity])
  async readingBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadingBooksArgs}) args: AccountReadingBooksArgs,
  ): Promise<ReadingBookRecordEntity[]> {
    return this.recordsService.getReadingRecordsFromAccount(account, args);
  }

  @ResolveField(() => Int!)
  async countReadingBooks(@Parent() account: AccountEntity): Promise<number[]> {
    return this.recordsService.countReadingRecordFromAccount(account);
  }

  @ResolveField(() => [WishReadBookRecordEntity])
  async wishReadBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountWishBooksArgs}) args: AccountWishBooksArgs,
  ): Promise<WishReadBookRecordEntity[]> {
    return this.recordsService.getWishReadRecordEntity(account, args);
  }

  @ResolveField(() => Int!)
  async countWishReadBooks(
    @Parent() account: AccountEntity,
  ): Promise<number[]> {
    return this.recordsService.countWishReadRecordFromAccount(account);
  }

  @ResolveField(() => [HaveBookRecordEntity])
  async haveBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountHaveBooksArgs}) args: AccountHaveBooksArgs,
  ): Promise<HaveBookRecordEntity[]> {
    return this.recordsService.getHaveRecordEntity(account, args);
  }

  @ResolveField(() => Int!)
  async countHaveBooks(@Parent() account: AccountEntity): Promise<number[]> {
    return this.recordsService.countHaveRecordFromAccount(account);
  }

  @ResolveField(() => [StackedRecordEntity])
  async stackedBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountStackedBooksArgs}) args: AccountStackedBooksArgs,
  ): Promise<StackedRecordEntity[]> {
    return this.recordsService.getStackedRecordsFromAccount(account, args);
  }

  @ResolveField(() => Int!)
  async countStackedBooks(@Parent() account: AccountEntity): Promise<number[]> {
    return this.recordsService.countStackedRecordsFromAccount(account);
  }
}
