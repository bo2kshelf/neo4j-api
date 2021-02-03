import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {BookEntity} from './book.entity';
import {BooksService} from './books.service';

@Resolver('Book')
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.booksService.findBookById(reference.id);
  }

  @ResolveField()
  isbn(
    @Parent() parent: BookEntity,
    @Args() {dehyphenize}: {dehyphenize: boolean},
  ) {
    if (dehyphenize && parent?.isbn) return parent.isbn.replace(/-/g, '');
    return parent?.isbn;
  }

  @Query()
  async book(@Args('id') id: string): Promise<BookEntity> {
    return this.booksService.findBookById(id);
  }

  @Query()
  async allBooks(): Promise<BookEntity[]> {
    return this.booksService.findAllBooks();
  }

  @Mutation()
  async createBook(
    @Args() {data}: {data: {title: string; isbn?: string}},
  ): Promise<BookEntity> {
    return this.booksService.createBook(data);
  }
}
