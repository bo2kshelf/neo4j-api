import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {AuthorEntity} from '../entities/author.entity';
import {WritingEntity} from '../entities/writing.entity';
import {AuthorsService} from '../services/authors.service';

@Resolver(() => WritingEntity)
export class WritingResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly authorsService: AuthorsService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: WritingEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => AuthorEntity)
  async author(@Parent() {authorId}: WritingEntity): Promise<AuthorEntity> {
    return this.authorsService.findById(authorId);
  }
}
