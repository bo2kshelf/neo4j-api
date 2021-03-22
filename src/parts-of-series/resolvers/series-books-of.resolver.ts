import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {SeriesEntity} from '../../series/series.entity';
import {SeriesPartsPayloadEntity} from '../part-of-series.entity';
import {PartsOfSeriesService} from '../parts-of-series.service';
import {ResolveBooksOfArgs} from './dto/resolve-books-of.dto';

@Resolver(() => SeriesEntity)
export class SeriesBooksOfResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => SeriesPartsPayloadEntity)
  async booksOf(
    @Parent() series: SeriesEntity,
    @Args({type: () => ResolveBooksOfArgs}) args: ResolveBooksOfArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.partsService.unionFromSeries(series, args);
  }
}
