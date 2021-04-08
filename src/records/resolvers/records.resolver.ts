import {Args, ID, Parent, Query, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {UserEntity} from '../../users/entities/users.entity';
import {UsersService} from '../../users/services/users.service';
import {RecordEntity} from '../entities/record.entity';
import {RecordsService} from '../services/records.service';

@Resolver(() => RecordEntity)
export class RecordResolver {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly usersService: UsersService,
    private readonly booksService: BooksService,
  ) {}

  @Query(() => RecordEntity)
  async recordById(
    @Args('id', {type: () => ID}) id: string,
  ): Promise<RecordEntity> {
    return this.recordsService.findById(id);
  }

  @ResolveField(() => UserEntity)
  async user(@Parent() {id}: RecordEntity): Promise<UserEntity> {
    const userId = await this.recordsService.getUserIdByRecord(id);
    return this.usersService.findById(userId);
  }

  @ResolveField(() => BookEntity)
  async book(@Parent() {id}: RecordEntity): Promise<BookEntity> {
    const bookId = await this.recordsService.getBookIdByRecord(id);
    return this.booksService.findById(bookId);
  }
}
