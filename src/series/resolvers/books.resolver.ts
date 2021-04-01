import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesService} from '../services/series.service';
import {
  BooksPartOfSeriesReturn,
  ResolveBooksIsPartOfSeriesArgs,
} from './dto/resolve-books-series-of.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveField(() => BooksPartOfSeriesReturn)
  async seriesOf(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksIsPartOfSeriesArgs})
    args: ResolveBooksIsPartOfSeriesArgs,
  ): Promise<BooksPartOfSeriesReturn> {
    return this.seriesService.getPartsFromBook(bookId, args);
  }
}
