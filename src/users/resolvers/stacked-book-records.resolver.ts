import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {StackedBookRecordEntity} from '../entities/stacked-book-record.entity';
import {UserEntity} from '../entities/users.entity';
import {UsersService} from '../services/users.service';

@Resolver(() => StackedBookRecordEntity)
export class StackedBookRecordResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  @ResolveField(() => UserEntity)
  async user(@Parent() {userId}: StackedBookRecordEntity): Promise<UserEntity> {
    return this.usersService.findById(userId);
  }

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: StackedBookRecordEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }
}
