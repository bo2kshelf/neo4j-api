import {Args, Query, Resolver, ResolveReference} from '@nestjs/graphql';
import {BookEntity} from './book.entity';
import {BooksService} from './books.service';

@Resolver('Book')
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.booksService.findById(reference.id);
  }

  @Query()
  async book(@Args('id') id: string): Promise<BookEntity> {
    return this.booksService.findById(id);
  }
}
