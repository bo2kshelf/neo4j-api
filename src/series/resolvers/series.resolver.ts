import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {SeriesMainPartEntity} from '../entities/series-main-part.entity';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';
import {GetSeriesArgs} from './dto/get-series.dto';
import {
  ResolveSeriesPartsArgs,
  ResolveSeriesPartsReturnEntity,
} from './dto/resolve-series-parts.dto';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @ResolveField(() => SeriesMainPartEntity)
  head(@Parent() {id: seriesId}: SeriesEntity): Promise<SeriesMainPartEntity> {
    return this.seriesService.getHeadOfSeries(seriesId);
  }

  @ResolveField(() => ResolveSeriesPartsReturnEntity)
  parts(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesPartsArgs})
    args: ResolveSeriesPartsArgs,
  ): Promise<ResolveSeriesPartsReturnEntity> {
    return this.seriesService.getPartsOfSeries(seriesId, args);
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

  /*
  @Mutation(() => SeriesEntity)
  async createSeries(
    @Args({type: () => CreateSeriesArgs}) args: CreateSeriesArgs,
  ): Promise<SeriesEntity> {
    return this.seriesService.create(args);
  }

  @Mutation(() => SeriesPartEntity)
  async addBookToSeries(
    @Args({type: () => AddBookToSeriesArgs})
    {bookId, seriesId, ...rest}: AddBookToSeriesArgs,
  ): Promise<SeriesPartEntity> {
    return this.seriesService.addBookToSeries({bookId, seriesId}, rest);
  }
  */
}
