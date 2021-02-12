import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {SeriesEntity} from '../../series/series.entity';
import {SeriesPartsPayloadEntity} from '../part-of-series.entity';
import {PartsOfSeriesService} from '../parts-of-series.service';
import {SeriesPartsArgs} from './dto/series-books.dto';

@Resolver(() => SeriesEntity)
export class SeriesPartsResolver {
  constructor(private readonly partsService: PartsOfSeriesService) {}

  @ResolveField(() => SeriesPartsPayloadEntity)
  async booksOf(
    @Parent() series: SeriesEntity,
    @Args({type: () => SeriesPartsArgs}) args: SeriesPartsArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.partsService.unionFromSeries(series, args);
  }
}
