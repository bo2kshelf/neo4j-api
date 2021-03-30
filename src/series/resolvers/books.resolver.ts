import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesPartsPayloadEntity} from '../entities/series-part.entities';
import {SeriesService} from '../services/series.service';
import {ResolveBooksIsPartOfSeriesArgs} from './dto/resolve-books-is-part-of-series.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveField(() => SeriesPartsPayloadEntity)
  async seriesOf(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => ResolveBooksIsPartOfSeriesArgs})
    args: ResolveBooksIsPartOfSeriesArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.seriesService.getPartsFromBook(bookId, args);
  }
}
