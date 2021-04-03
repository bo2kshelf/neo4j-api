import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {UserEntity} from '../entities/users.entity';
import {WishReadBookRecordEntity} from '../entities/wish-read-book-record.entity';
import {UsersService} from '../services/users.service';

@Resolver(() => WishReadBookRecordEntity)
export class WishReadBookRecordResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  @ResolveField(() => UserEntity)
  async user(
    @Parent() {userId}: WishReadBookRecordEntity,
  ): Promise<UserEntity> {
    return this.usersService.findById(userId);
  }

  @ResolveField(() => BookEntity)
  async book(
    @Parent() {bookId}: WishReadBookRecordEntity,
  ): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }
}
