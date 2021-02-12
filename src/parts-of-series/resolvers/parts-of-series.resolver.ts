import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {SeriesPartEntity} from '../part-of-series.entity';
import {PartsOfSeriesService} from '../parts-of-series.service';
import {ConnectBookToSeriesArgs} from './dto/connect-book-to-series.dto';

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
