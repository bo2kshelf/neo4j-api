import {
  Args,
  ArgsType,
  Field,
  ID,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import {HaveBookRecordEntity} from '../entities/have-book-record.entity';
import {ReadBookRecordEntity} from '../entities/read-book-record.entity';
import {ReadingBookRecordEntity} from '../entities/reading-book-record.entity';
import {UserEntity} from '../entities/users.entity';
import {WishReadBookRecordEntity} from '../entities/wish-read-book-record.entity';
import {UsersService} from '../services/users.service';
import {ReadBookArgs} from './dto/read-book.dto';
import {
  ResolveUsersHasBooksArgs,
  ResolveUsersHasBooksReturnEntity,
} from './dto/resolve-users-has-books.dto';
import {
  ResolveUsersReadBooksArgs,
  ResolveUsersReadBooksReturnEntity,
} from './dto/resolve-users-read-books.dto';
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

@ArgsType()
export class GetUserArgs {
  @Field(() => ID)
  id!: string;
}

@Resolver(() => UserEntity)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserEntity)
  async user(@Args({type: () => GetUserArgs}) {id}: GetUserArgs) {
    return this.usersService.findById(id);
  }

  @ResolveField(() => ResolveUsersReadBooksReturnEntity)
  async readBooks(
    @Parent() {id: userId}: UserEntity,
    @Args({type: () => ResolveUsersReadBooksArgs})
    args: ResolveUsersReadBooksArgs,
  ): Promise<ResolveUsersReadBooksReturnEntity> {
    return this.usersService.getReadBooks(userId, args);
  }

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

  @Mutation(() => ReadBookRecordEntity)
  async readBook(
    @Args({type: () => ReadBookArgs})
    {bookId, userId, ...props}: ReadBookArgs,
  ) {
    return this.usersService.readBook({bookId, userId}, props);
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
