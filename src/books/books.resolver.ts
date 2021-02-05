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
import {CreateBookArgs} from './dto/create-books.dto';
import {GetBookArgs} from './dto/get-book.dto';
import {BookISBNArgs} from './dto/isbn.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.booksService.findBookById(reference.id);
  }

  @ResolveField(() => String, {nullable: true})
  isbn(
    @Parent() parent: BookEntity,
    @Args({type: () => BookISBNArgs}) {dehyphenize}: BookISBNArgs,
  ) {
    if (dehyphenize && parent?.isbn) return parent.isbn.replace(/-/g, '');
    return parent?.isbn;
  }

  @Query(() => BookEntity)
  async book(
    @Args({type: () => GetBookArgs}) {id}: GetBookArgs,
  ): Promise<BookEntity> {
    return this.booksService.findBookById(id);
  }

  @Query(() => [BookEntity])
  async allBooks(): Promise<BookEntity[]> {
    return this.booksService.findAllBooks();
  }

  @Mutation(() => BookEntity)
  async createBook(
    @Args({type: () => CreateBookArgs})
    {data}: CreateBookArgs,
  ): Promise<BookEntity> {
    return this.booksService.createBook(data);
  }
}
