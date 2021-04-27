import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesService} from '../services/series.service';
import {
  BookNextBooksArgs,
  BookNextBooksReturnType,
} from './dto/resolve-book-next-books.dto';
import {
  BookPreviousBooksArgs,
  BookPreviousBooksReturnType,
} from './dto/resolve-book-previous-books.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveField(() => [SeriesPartEntity])
  async seriesOf(
    @Parent() {id: bookId}: BookEntity,
  ): Promise<SeriesPartEntity[]> {
    return this.seriesService.getSeriesFromBook(bookId);
  }

  @ResolveField(() => BookPreviousBooksReturnType)
  async previousBooks(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => BookPreviousBooksArgs})
    args: BookPreviousBooksArgs,
  ): Promise<BookPreviousBooksReturnType> {
    return this.seriesService.previousBooks(bookId, args);
  }

  @ResolveField(() => BookNextBooksReturnType)
  async nextBooks(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => BookNextBooksArgs})
    args: BookNextBooksArgs,
  ): Promise<BookNextBooksReturnType> {
    return this.seriesService.nextBooks(bookId, args);
  }
}
