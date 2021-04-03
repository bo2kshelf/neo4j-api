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
import {AddBookToSeriesArgs} from './dto/add-book-to-series.dto';
import {CreateSeriesArgs} from './dto/create-series.dto';
import {GetSeriesArgs} from './dto/get-series.dto';
import {
  ResolveSeriesConsistsOfArgs,
  ResolveSeriesConsistsOfReturnEntity,
} from './dto/resolve-series-consists-of.dto';

@Resolver(() => SeriesEntity)
export class SeriesResolver {
  constructor(private readonly seriesService: SeriesService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.seriesService.findById(reference.id);
  }

  @ResolveField(() => ResolveSeriesConsistsOfReturnEntity)
  async consistsOf(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesConsistsOfArgs})
    args: ResolveSeriesConsistsOfArgs,
  ): Promise<ResolveSeriesConsistsOfReturnEntity> {
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
    return this.seriesService.findAll();
  }

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
}
