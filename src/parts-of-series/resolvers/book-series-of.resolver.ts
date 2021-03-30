import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesPartsPayloadEntity} from '../part-of-series.entity';
import {PartsOfSeriesService} from '../parts-of-series.service';
import {BookSeriesOfArgs} from './dto/book-series-of.dto';

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
