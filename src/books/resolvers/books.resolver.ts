import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {BookEntity} from '../entities/book.entity';
import {BooksService} from '../services/books.service';
import {CreateBookArgs} from './dto/create-books.dto';
import {GetBookArgs} from './dto/get-book.dto';
import {BookISBNArgs} from './dto/isbn.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.booksService.findById(reference.id);
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
    return this.booksService.findById(id);
  }

  @Query(() => [BookEntity])
  async allBooks(): Promise<BookEntity[]> {
    return this.booksService.findAll();
  }

  @Mutation(() => BookEntity)
  async createBook(
    @Args({type: () => CreateBookArgs})
    args: CreateBookArgs,
  ): Promise<BookEntity> {
    return this.booksService.create(args);
  }
}
