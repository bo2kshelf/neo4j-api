import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {ReadBookRecordEntity} from '../entities/read-book-record.entity';
import {UserEntity} from '../entities/users.entity';
import {RecordsService} from '../services/records.service';
import {UsersService} from '../services/users.service';

@Resolver(() => ReadBookRecordEntity)
export class ReadBookRecordResolver {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  @Query(() => ReadBookRecordEntity)
  async recordById(
    @Args('id', {type: () => ID}) id: string,
  ): Promise<ReadBookRecordEntity> {
    return this.recordsService.findById(id);
  }

  @ResolveField(() => UserEntity)
  async user(@Parent() {id}: ReadBookRecordEntity): Promise<UserEntity> {
    const userId = await this.recordsService.getUserIdByRecord(id);
    return this.usersService.findById(userId);
  }

  @ResolveField(() => BookEntity)
  async book(@Parent() {id}: ReadBookRecordEntity): Promise<BookEntity> {
    const bookId = await this.recordsService.getBookIdByRecord(id);
    return this.booksService.findById(bookId);
  }
}
