import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {SeriesEntity} from './series.entity';
import {SeriesService} from './series.service';

@Resolver('Series')
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @Query()
  async series(@Args('id') id: string): Promise<SeriesEntity> {
    return this.seriesService.findById(id);
  }

  @Query()
  async allSeries(): Promise<SeriesEntity[]> {
    return this.seriesService.findAllSeries();
  }

  @Mutation()
  async createSeries(
    @Args() {data}: {data: {title: string}},
  ): Promise<SeriesEntity> {
    return this.seriesService.createSeries(data);
  }
}
