import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';
import {GetSeriesArgs} from './dto/get-series.dto';
import {
  SeriesRelatedBooksArgs,
  SeriesRelatedBooksReturnType,
} from './dto/resolve-series-related-books.dto';
import {
  SeriesSeriesBooksArgs,
  SeriesSeriesBooksReturnType,
} from './dto/resolve-series-series-books.dto';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @ResolveField(() => SeriesPartEntity)
  async headOf(
    @Parent() {id: seriesId}: SeriesEntity,
  ): Promise<SeriesPartEntity> {
    return this.seriesService.getHeadOfSeries(seriesId);
  }

  @ResolveField(() => SeriesSeriesBooksReturnType)
  async seriesBooks(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => SeriesSeriesBooksArgs})
    args: SeriesSeriesBooksArgs,
  ): Promise<SeriesSeriesBooksReturnType> {
    return this.seriesService.getPartsOfSeries(seriesId, args);
  }

  @ResolveField(() => SeriesRelatedBooksReturnType)
  async relatedBooks(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => SeriesRelatedBooksArgs})
    args: SeriesRelatedBooksArgs,
  ): Promise<SeriesRelatedBooksReturnType> {
    return this.seriesService.getSubPartsOfSeries(seriesId, args);
  }

  @Query(() => SeriesEntity)
  async series(
    @Args({type: () => GetSeriesArgs}) {id}: GetSeriesArgs,
  ): Promise<SeriesEntity> {
    return this.seriesService.findById(id);
  }

  @Query(() => [SeriesEntity])
  async allSeries(): Promise<SeriesEntity[]> {
    return this.seriesService.findAll();
  }
}
