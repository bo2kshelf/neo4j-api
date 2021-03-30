import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {
  SeriesPartEntity,
  SeriesPartsPayloadEntity,
} from '../entities/series-part.entities';
import {SeriesEntity} from '../entities/series.entity';
import {SeriesService} from '../services/series.service';
import {AddBookToSeriesArgs} from './dto/add-book-to-series.dto';
import {CreateSeriesArgs} from './dto/create-series.dto';
import {GetSeriesArgs} from './dto/get-series.dto';
import {ResolveSeriesPartsArgs} from './dto/resolve-series-parts.dto';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @ResolveField(() => SeriesPartsPayloadEntity)
  async parts(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesPartsArgs})
    args: ResolveSeriesPartsArgs,
  ): Promise<SeriesPartsPayloadEntity> {
    return this.seriesService.getPartsFromSeries(seriesId, args);
  }

  @Query(() => SeriesEntity)
  async series(
    @Args({type: () => GetSeriesArgs}) {id}: GetSeriesArgs,
  ): Promise<SeriesEntity> {
    return this.seriesService.findById(id);
  }

  @Query(() => [SeriesEntity])
  async allSeries(): Promise<SeriesEntity[]> {
    return this.seriesService.findAllSeries();
  }

  @Mutation(() => SeriesEntity)
  async createSeries(
    @Args({type: () => CreateSeriesArgs}) args: CreateSeriesArgs,
  ): Promise<SeriesEntity> {
    return this.seriesService.createSeries(args);
  }

  @Mutation(() => SeriesPartEntity)
  async addBookToSeries(
    @Args({type: () => AddBookToSeriesArgs})
    {bookId, seriesId, ...rest}: AddBookToSeriesArgs,
  ): Promise<SeriesPartEntity> {
    return this.seriesService.addBookToSeries({bookId, seriesId}, rest);
  }
}
