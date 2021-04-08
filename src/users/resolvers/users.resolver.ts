import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {HaveBookRecordEntity} from '../entities/have-book-record.entity';
import {ReadingBookRecordEntity} from '../entities/reading-book-record.entity';
import {UserEntity} from '../entities/users.entity';
import {WishReadBookRecordEntity} from '../entities/wish-read-book-record.entity';
import {UsersService} from '../services/users.service';
import {
  ResolveUsersHasBooksArgs,
  ResolveUsersHasBooksReturnEntity,
} from './dto/resolve-users-has-books.dto';
import {
  ResolveUsersReadingBooksArgs,
  ResolveUsersReadingBooksReturnEntity,
} from './dto/resolve-users-reading-books.dto';
import {
  ResolveUsersStackedBooksArgs,
  ResolveUsersStackedBooksReturnEntity,
} from './dto/resolve-users-stacked-books.dto';
import {
  ResolveUsersWishesReadBooksArgs,
  ResolveUsersWishesReadBooksReturnEntity,
} from './dto/resolve-users-wishes-read-books.dto';
import {SetHaveBookArgs} from './dto/set-have-book.dto';
import {SetReadingBookArgs} from './dto/set-reading-book.dto';
import {SetWishReadBookArgs} from './dto/set-wish-read-book';

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @ResolveField(() => ResolveUsersReadingBooksReturnEntity)
  async readingBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersReadingBooksArgs})
    args: ResolveUsersReadingBooksArgs,
  ): Promise<ResolveUsersReadingBooksReturnEntity> {
    return this.usersService.getReadingBooks(userId, args);
  }

  @ResolveField(() => ResolveUsersHasBooksReturnEntity)
  async hasBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersHasBooksArgs})
    args: ResolveUsersHasBooksArgs,
  ): Promise<ResolveUsersHasBooksReturnEntity> {
    return this.usersService.getHaveBooks(userId, args);
  }

  @ResolveField(() => ResolveUsersWishesReadBooksReturnEntity)
  async wishesReadBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersWishesReadBooksArgs})
    args: ResolveUsersWishesReadBooksArgs,
  ): Promise<ResolveUsersWishesReadBooksReturnEntity> {
    return this.usersService.getWishesToReadBook(userId, args);
  }

  @ResolveField(() => ResolveUsersStackedBooksReturnEntity)
  async stackedBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersStackedBooksArgs})
    args: ResolveUsersStackedBooksArgs,
  ): Promise<ResolveUsersStackedBooksReturnEntity> {
    return this.usersService.getStackedBooks(userId, args);
  }

  @Mutation(() => ReadingBookRecordEntity)
  async setReadingBook(
    @Args({type: () => SetReadingBookArgs})
    {bookId, userId, ...props}: SetReadingBookArgs,
  ) {
    return this.usersService.setReadingBook({bookId, userId}, props);
  }

  @Mutation(() => HaveBookRecordEntity)
  async setHaveBook(
    @Args({type: () => SetHaveBookArgs})
    {bookId, userId, ...props}: SetHaveBookArgs,
  ) {
    return this.usersService.setHaveBook({bookId, userId}, props);
  }

  @Mutation(() => WishReadBookRecordEntity)
  async setWishReadBook(
    @Args({type: () => SetWishReadBookArgs})
    {bookId, userId, ...props}: SetWishReadBookArgs,
  ) {
    return this.usersService.setWishReadBook({bookId, userId}, props);
  }
}
