import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AccountEntity} from '../../accounts/account.entity';
import {HaveBooksPayloadEntity} from '../entities/have-book.entities';
import {ReadBooksPayloadEntity} from '../entities/read-book.entities';
import {ReadingBooksPayloadEntity} from '../entities/reading-book.entities';
import {StackedBooksPayloadEntity} from '../entities/stacked-book.entities';
import {WishReadBooksPayloadEntity} from '../entities/wish-read-book.entities';
import {HaveBooksService} from '../services/have-books.service';
import {ReadBooksService} from '../services/read-books.service';
import {ReadingBooksService} from '../services/reading-books.service';
import {StackedBooksService} from '../services/stacked-books.service';
import {WishReadBooksService} from '../services/wish-read-books.service';
import {AccountHaveBooksArgs} from './dto/account-have-books.dto';
import {AccountReadBooksArgs} from './dto/account-read-books.dto';
import {AccountReadingBooksArgs} from './dto/account-reading-books.dto';
import {AccountStackedBooksArgs} from './dto/account-stacked-books.dto';
import {AccountWishBooksArgs} from './dto/account-wish-books.dto';

@Resolver(() => AccountEntity)
export class AccountRecordsResolver {
  constructor(
    private readonly readService: ReadBooksService,
    private readonly readingService: ReadingBooksService,
    private readonly wishService: WishReadBooksService,
    private readonly haveService: HaveBooksService,
    private readonly stackedService: StackedBooksService,
  ) {}

  @ResolveField(() => ReadBooksPayloadEntity)
  async readBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadBooksArgs}) args: AccountReadBooksArgs,
  ): Promise<ReadBooksPayloadEntity> {
    return this.readService.unionResult(account, args);
  }

  @ResolveField(() => ReadingBooksPayloadEntity)
  async readingBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountReadingBooksArgs}) args: AccountReadingBooksArgs,
  ): Promise<ReadingBooksPayloadEntity> {
    return this.readingService.unionResult(account, args);
  }

  @ResolveField(() => WishReadBooksPayloadEntity)
  async wishReadBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountWishBooksArgs}) args: AccountWishBooksArgs,
  ): Promise<WishReadBooksPayloadEntity> {
    return this.wishService.unionResult(account, args);
  }

  @ResolveField(() => HaveBooksPayloadEntity)
  async haveBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountHaveBooksArgs}) args: AccountHaveBooksArgs,
  ): Promise<HaveBooksPayloadEntity> {
    return this.haveService.unionResult(account, args);
  }

  @ResolveField(() => StackedBooksPayloadEntity)
  async stackedBooks(
    @Parent() account: AccountEntity,
    @Args({type: () => AccountStackedBooksArgs}) args: AccountStackedBooksArgs,
  ): Promise<StackedBooksPayloadEntity> {
    return this.stackedService.unionResult(account, args);
  }
}
