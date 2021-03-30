import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {
  HaveBooksPayloadEntity,
  ReadBooksPayloadEntity,
  ReadingBooksPayloadEntity,
  StackedBooksPayloadEntity,
  WishReadBooksPayloadEntity,
} from '../entities/payload.entities';
import {
  HaveBookRecordEntity,
  ReadBookRecordEntity,
  ReadingBookRecordEntity,
  WishReadBookRecordEntity,
} from '../entities/record.entities';
import {UserEntity} from '../entities/users.entity';
import {UsersService} from '../services/users.service';
import {HasBookArgs} from './dto/has-book.dto';
import {IsReadingBookArgs} from './dto/is-reading-book.dto';
import {ReadBookArgs} from './dto/read-book.dto';
import {ResolveUserHaveBooksArgs} from './dto/resolve-user-have-books.dto';
import {ResolveUserReadBooksArgs} from './dto/resolve-user-read-books.dto';
import {ResolveUserReadingBooksArgs} from './dto/resolve-user-reading-books.dto';
import {ResolveUserStackedBooksArgs} from './dto/resolve-user-stacked-books.dto';
import {UserWishBooksArgs} from './dto/resolve-user-wish-books.dto';
import {WishesToReadBookArgs} from './dto/wishes-to-read-book.dto';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @ResolveField(() => ReadBooksPayloadEntity)
  async readBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUserReadBooksArgs})
    args: ResolveUserReadBooksArgs,
  ): Promise<ReadBooksPayloadEntity> {
    return this.usersService.getReadBooks(userId, args);
  }

  @ResolveField(() => ReadingBooksPayloadEntity)
  async readingBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUserReadingBooksArgs})
    args: ResolveUserReadingBooksArgs,
  ): Promise<ReadingBooksPayloadEntity> {
    return this.usersService.getReadingBooks(userId, args);
  }

  @ResolveField(() => HaveBooksPayloadEntity)
  async haveBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUserHaveBooksArgs})
    args: ResolveUserHaveBooksArgs,
  ): Promise<HaveBooksPayloadEntity> {
    return this.usersService.getHaveBooks(userId, args);
  }

  @ResolveField(() => WishReadBooksPayloadEntity)
  async wishReadBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => UserWishBooksArgs}) args: UserWishBooksArgs,
  ): Promise<WishReadBooksPayloadEntity> {
    return this.usersService.getWishesToReadBook(userId, args);
  }

  @ResolveField(() => StackedBooksPayloadEntity)
  async stackedBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUserStackedBooksArgs})
    args: ResolveUserStackedBooksArgs,
  ): Promise<StackedBooksPayloadEntity> {
    return this.usersService.getStackedBooks(userId, args);
  }

  @Mutation(() => ReadBookRecordEntity)
  async readBook(
    @Args({type: () => ReadBookArgs})
    args: ReadBookArgs,
  ) {
    return this.usersService.readBook(args);
  }

  @Mutation(() => ReadingBookRecordEntity)
  async isReadingBook(
    @Args({type: () => IsReadingBookArgs})
    args: IsReadingBookArgs,
  ) {
    return this.usersService.isReadingBook(args);
  }

  @Mutation(() => HaveBookRecordEntity)
  async hasBook(
    @Args({type: () => HasBookArgs})
    args: HasBookArgs,
  ) {
    return this.usersService.hasBook(args);
  }

  @Mutation(() => WishReadBookRecordEntity)
  async wishesToReadBook(
    @Args({type: () => WishesToReadBookArgs})
    args: WishesToReadBookArgs,
  ) {
    return this.usersService.wishesToReadBook(args);
  }
}
