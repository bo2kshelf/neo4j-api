import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';
import {SeriesPartEntity} from './series-part.entity';
import {SeriesPartService} from './series-parts.service';

@Resolver('SeriesPart')
export class SeriesPartResolver {
  constructor(private readonly partsService: SeriesPartService) {}

  @ResolveField()
  @Resolver('Book')
  async seriesOf(
    @Parent() book: BookEntity,
    @Args() args: {skip?: number; limit?: number},
  ): Promise<SeriesPartEntity[]> {
    return this.partsService.getFromBook(book, args);
  }

  @ResolveField()
  @Resolver('Series')
  async parts(
    @Parent() series: SeriesEntity,
    @Args() args: {skip?: number; limit?: number},
  ): Promise<SeriesPartEntity[]> {
    return this.partsService.getFromSeries(series, args);
  }

  @Mutation()
  async registerBookToSeries(
    @Args()
    {
      data: {bookId, seriesId, ...rest},
    }: {
      data: {bookId: string; seriesId: string; volume?: number};
    },
  ): Promise<SeriesPartEntity> {
    return this.partsService.connectSeriesAndBook({bookId, seriesId}, rest);
  }
}
