import {Args, Mutation, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';
import {SeriesPartsArgs} from './dto/author-writes.dto';
import {BookSeriesOfArgs} from './dto/book-writed-by.dto';
import {ConnectBookToSeriesArgs} from './dto/connect-book-to-series.dto';
import {SeriesPartEntity} from './series-part.entity';
import {SeriesPartService} from './series-parts.service';

@Resolver(() => SeriesPartEntity)
export class SeriesPartResolver {
  constructor(private readonly partsService: SeriesPartService) {}

  @Mutation(() => SeriesPartEntity)
  async registerBookToSeries(
    @Args({type: () => ConnectBookToSeriesArgs})
    {bookId, seriesId, ...rest}: ConnectBookToSeriesArgs,
  ): Promise<SeriesPartEntity> {
    return this.partsService.connectSeriesAndBook({bookId, seriesId}, rest);
  }
}

@Resolver(() => BookEntity)
export class BookSeriesOfResolver {
  constructor(private readonly partsService: SeriesPartService) {}

  @ResolveField()
  async seriesOf(
    @Parent() book: BookEntity,
    @Args({type: () => BookSeriesOfArgs}) args: BookSeriesOfArgs,
  ): Promise<SeriesPartEntity[]> {
    return this.partsService.getFromBook(book, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesPartsResolver {
  constructor(private readonly partsService: SeriesPartService) {}

  @ResolveField()
  async parts(
    @Parent() series: SeriesEntity,
    @Args({type: () => SeriesPartsArgs}) args: SeriesPartsArgs,
  ): Promise<SeriesPartEntity[]> {
    return this.partsService.getFromSeries(series, args);
  }
}
