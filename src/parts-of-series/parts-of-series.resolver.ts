import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';
import {SeriesPartsArgs} from './dto/author-writes.dto';
import {BookSeriesOfArgs} from './dto/book-writed-by.dto';
import {ConnectBookToSeriesArgs} from './dto/connect-book-to-series.dto';
import {
  SeriesPartEntity,
  SeriesPartsPayloadEntity,
} from './part-of-series.entity';
import {PartsOfSeriesService} from './parts-of-series.service';

@Resolver(() => SeriesPartEntity)
export class PartsOfSeriesResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @Mutation(() => SeriesPartEntity)
  async connectBookToSeries(
    @Args({type: () => ConnectBookToSeriesArgs})
    {bookId, seriesId, ...rest}: ConnectBookToSeriesArgs,
  ): Promise<SeriesPartEntity> {
    return this.partsService.connectSeriesAndBook({bookId, seriesId}, rest);
  }
}

@Resolver(() => BookEntity)
export class BookSeriesOfResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => SeriesPartsPayloadEntity)
  async seriesOf(
    @Parent() book: BookEntity,
    @Args({type: () => BookSeriesOfArgs}) args: BookSeriesOfArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.partsService.unionFromBook(book, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesPartsResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => SeriesPartsPayloadEntity)
  async parts(
    @Parent() series: SeriesEntity,
    @Args({type: () => SeriesPartsArgs}) args: SeriesPartsArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.partsService.unionFromSeries(series, args);
  }
}
