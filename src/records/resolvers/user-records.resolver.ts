import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {UserEntity} from '../../users/users.entity';
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
import {UserHaveBooksArgs} from './dto/user-have-books.dto';
import {UserReadBooksArgs} from './dto/user-read-books.dto';
import {UserReadingBooksArgs} from './dto/user-reading-books.dto';
import {UserStackedBooksArgs} from './dto/user-stacked-books.dto';
import {UserWishBooksArgs} from './dto/user-wish-books.dto';

@Resolver(() => UserEntity)
export class UserRecordsResolver {
  constructor(
    private readonly readService: ReadBooksService,
    private readonly readingService: ReadingBooksService,
    private readonly wishService: WishReadBooksService,
    private readonly haveService: HaveBooksService,
    private readonly stackedService: StackedBooksService,
  ) {}

  @ResolveField(() => ReadBooksPayloadEntity)
  async readBooks(
    @Parent() user: UserEntity,
    @Args({type: () => UserReadBooksArgs}) args: UserReadBooksArgs,
  ): Promise<ReadBooksPayloadEntity> {
    return this.readService.unionResult(user, args);
  }

  @ResolveField(() => ReadingBooksPayloadEntity)
  async readingBooks(
    @Parent() user: UserEntity,
    @Args({type: () => UserReadingBooksArgs}) args: UserReadingBooksArgs,
  ): Promise<ReadingBooksPayloadEntity> {
    return this.readingService.unionResult(user, args);
  }

  @ResolveField(() => WishReadBooksPayloadEntity)
  async wishReadBooks(
    @Parent() user: UserEntity,
    @Args({type: () => UserWishBooksArgs}) args: UserWishBooksArgs,
  ): Promise<WishReadBooksPayloadEntity> {
    return this.wishService.unionResult(user, args);
  }

  @ResolveField(() => HaveBooksPayloadEntity)
  async haveBooks(
    @Parent() user: UserEntity,
    @Args({type: () => UserHaveBooksArgs}) args: UserHaveBooksArgs,
  ): Promise<HaveBooksPayloadEntity> {
    return this.haveService.unionResult(user, args);
  }

  @ResolveField(() => StackedBooksPayloadEntity)
  async stackedBooks(
    @Parent() user: UserEntity,
    @Args({type: () => UserStackedBooksArgs}) args: UserStackedBooksArgs,
  ): Promise<StackedBooksPayloadEntity> {
    return this.stackedService.unionResult(user, args);
  }
}
