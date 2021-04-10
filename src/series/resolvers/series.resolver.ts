import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {SeriesPartEntity} from '../entities/series-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';
import {CreateSeriesArgs} from './dto/create-series.dto';
import {GetSeriesArgs} from './dto/get-series.dto';
import {
  ResolveSeriesPartsArgs,
  ResolveSeriesPartsReturnEntity,
} from './dto/resolve-series-parts.dto';
import {ResolveSeriesSubPartsArgs} from './dto/resolve-series-sub-parts.dto';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @ResolveField(() => SeriesPartEntity)
  async head(
    @Parent() {id: seriesId}: SeriesEntity,
  ): Promise<SeriesPartEntity> {
    return this.seriesService.getHeadOfSeries(seriesId);
  }

  @ResolveField(() => ResolveSeriesPartsReturnEntity)
  async parts(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesPartsArgs})
    args: ResolveSeriesPartsArgs,
  ): Promise<ResolveSeriesPartsReturnEntity> {
    return this.seriesService.getPartsOfSeries(seriesId, args);
  }

  @ResolveField(() => ResolveSeriesPartsReturnEntity)
  async subParts(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesSubPartsArgs})
    args: ResolveSeriesSubPartsArgs,
  ): Promise<ResolveSeriesPartsReturnEntity> {
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

  @Mutation(() => SeriesPartEntity)
  async createSeries(
    @Args({type: () => CreateSeriesArgs}) {bookId, ...data}: CreateSeriesArgs,
  ): Promise<SeriesPartEntity> {
    return this.seriesService.createSeries(bookId, data);
  }
}
