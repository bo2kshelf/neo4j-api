import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesMainPartEntity} from '../entities/series-main-part.entity';
import {SeriesService} from '../services/series.service';
import {
  ResolveBooksNextArgs,
  ResolveBooksNextReturn,
} from './dto/resolve-books-next.dto';
import {
  ResolveBooksPreviousArgs,
  ResolveBooksPreviousReturn,
} from './dto/resolve-books-previous.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveField(() => [SeriesMainPartEntity])
  async seriesOf(
    @Parent() {id: bookId}: BookEntity,
  ): Promise<SeriesMainPartEntity[]> {
    return this.seriesService.getSeriesFromBook(bookId);
  }

  @ResolveField(() => ResolveBooksPreviousReturn)
  async previous(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksPreviousArgs})
    args: ResolveBooksPreviousArgs,
  ): Promise<ResolveBooksPreviousReturn> {
    return this.seriesService.previousBooks(bookId, args);
  }

  @ResolveField(() => ResolveBooksNextReturn)
  async next(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksNextArgs})
    args: ResolveBooksNextArgs,
  ): Promise<ResolveBooksNextReturn> {
    return this.seriesService.nextBooks(bookId, args);
  }
}
