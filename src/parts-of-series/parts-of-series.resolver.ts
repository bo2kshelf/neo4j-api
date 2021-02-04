import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';
import {SeriesPartsArgs} from './dto/author-writes.dto';
import {BookSeriesOfArgs} from './dto/book-writed-by.dto';
import {ConnectBookToSeriesArgs} from './dto/connect-book-to-series.dto';
import {PartOfSeriesEntity} from './part-of-series.entity';
import {PartsOfSeriesService} from './parts-of-series.service';

@Resolver(() => PartOfSeriesEntity)
export class PartsOfSeriesResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @Mutation(() => PartOfSeriesEntity)
  async connectBookToSeries(
    @Args({type: () => ConnectBookToSeriesArgs})
    {bookId, seriesId, ...rest}: ConnectBookToSeriesArgs,
  ): Promise<PartOfSeriesEntity> {
    return this.partsService.connectSeriesAndBook({bookId, seriesId}, rest);
  }
}

@Resolver(() => BookEntity)
export class BookSeriesOfResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => [PartOfSeriesEntity])
  async seriesOf(
    @Parent() book: BookEntity,
    @Args({type: () => BookSeriesOfArgs}) args: BookSeriesOfArgs,
  ): Promise<PartOfSeriesEntity[]> {
    return this.partsService.getFromBook(book, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesPartsResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => [PartOfSeriesEntity])
  async parts(
    @Parent() series: SeriesEntity,
    @Args({type: () => SeriesPartsArgs}) args: SeriesPartsArgs,
  ): Promise<PartOfSeriesEntity[]> {
    return this.partsService.getFromSeries(series, args);
  }
}
