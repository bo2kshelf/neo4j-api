import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {WritingEntity} from '../entities/writing.entity';
import {AuthorsService} from '../services/authors.service';
import {ResolveBooksWrittenByArgs} from './dto/resolve-books-written-by.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveField(() => [WritingEntity])
  async writtenBy(
    @Parent() book: BookEntity,
    @Args({type: () => ResolveBooksWrittenByArgs})
    args: ResolveBooksWrittenByArgs,
  ): Promise<WritingEntity[]> {
    return this.authorsService.getWritingFromBook(book.id, args);
  }
}
