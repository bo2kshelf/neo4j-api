import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {NextBookConnection} from '../entities/next-book-connection.entity';

@Resolver(() => NextBookConnection)
export class NextBookConnectionsResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveField(() => BookEntity)
  async previous(
    @Parent() {previousId}: NextBookConnection,
  ): Promise<BookEntity> {
    return this.booksService.findById(previousId);
  }

  @ResolveField(() => BookEntity)
  async next(@Parent() {nextId}: NextBookConnection): Promise<BookEntity> {
    return this.booksService.findById(nextId);
  }
}
