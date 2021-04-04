import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AuthorEntity} from '../../authors/entities/author.entity';
import {AuthorsService} from '../../authors/services/authors.service';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesEntity} from '../../series/entities/series.entity';
import {SeriesService} from '../../series/services/series.service';
import {AuthorSeriesRelationEntity} from '../entities/author-series.entity';
import {AuthorSeriesRelationsService} from '../services/author-series.service';
import {
  ResolveAuthorSeriesRelationRelatedBooksArgs,
  ResolveAuthorsRelatedSeriesArgs,
  ResolveAuthorsRelatedSeriesReturn,
  ResolveSeriesRelatedAuthorsArgs,
  ResolveSeriesRelatedAuthorsReturn,
} from './dto/author-series.dtos';

@Resolver(() => AuthorSeriesRelationEntity)
export class RelationResolver {
  constructor(
    private readonly relationService: AuthorSeriesRelationsService,
    private readonly authorsService: AuthorsService,
    private readonly seriesService: SeriesService,
  ) {}

  @ResolveField(() => AuthorEntity)
  async author(
    @Parent() {authorId}: AuthorSeriesRelationEntity,
  ): Promise<AuthorEntity> {
    return this.authorsService.findById(authorId);
  }

  @ResolveField(() => SeriesEntity)
  async series(
    @Parent() {seriesId}: AuthorSeriesRelationEntity,
  ): Promise<SeriesEntity> {
    return this.seriesService.findById(seriesId);
  }

  @ResolveField(() => [BookEntity])
  async relatedBooks(
    @Parent() {seriesId, authorId}: AuthorSeriesRelationEntity,
    @Args({type: () => ResolveAuthorSeriesRelationRelatedBooksArgs})
    args: ResolveAuthorSeriesRelationRelatedBooksArgs,
  ): Promise<BookEntity[]> {
    return this.relationService.getRelatedBooks({seriesId, authorId}, args);
  }
}

@Resolver(() => AuthorEntity)
export class AuthorsResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => ResolveAuthorsRelatedSeriesReturn)
  async relatedSeries(
    @Parent() {id: authorId}: AuthorEntity,
    @Args({type: () => ResolveAuthorsRelatedSeriesArgs})
    args: ResolveAuthorsRelatedSeriesArgs,
  ): Promise<ResolveAuthorsRelatedSeriesReturn> {
    return this.relationService.getFromAuthor(authorId, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesRelatedAuthorsResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => ResolveSeriesRelatedAuthorsReturn)
  async relatedAuthors(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesRelatedAuthorsArgs})
    args: ResolveSeriesRelatedAuthorsArgs,
  ): Promise<ResolveSeriesRelatedAuthorsReturn> {
    return this.relationService.getFromSeries(seriesId, args);
  }
}
