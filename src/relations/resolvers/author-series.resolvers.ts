import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AuthorEntity} from '../../authors/entities/author.entity';
import {BookEntity} from '../../books/entities/book.entity';
import {SeriesEntity} from '../../series/entities/series.entity';
import {AuthorSeriesRelationEntity} from '../entities/author-series.entity';
import {AuthorSeriesRelationsService} from '../services/author-series.service';
import {
  ResolveAuthorSeriesRelationRelatedBooksArgs,
  ResolveAuthorsRelatedSeriesArgs,
  ResolveSeriesRelatedAuthorsArgs,
} from './dto/author-series.dtos';

@Resolver(() => AuthorSeriesRelationEntity)
export class RelationResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [BookEntity])
  async relatedBooks(
    @Parent() {series, author}: AuthorSeriesRelationEntity,
    @Args({type: () => ResolveAuthorSeriesRelationRelatedBooksArgs})
    args: ResolveAuthorSeriesRelationRelatedBooksArgs,
  ): Promise<BookEntity[]> {
    return this.relationService.getRelatedBooks({series, author}, args);
  }
}

@Resolver(() => AuthorEntity)
export class AuthorsResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [AuthorSeriesRelationEntity])
  async relatedSeries(
    @Parent() {id: authorId}: AuthorEntity,
    @Args({type: () => ResolveAuthorsRelatedSeriesArgs})
    args: ResolveAuthorsRelatedSeriesArgs,
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.relationService.getFromAuthor(authorId, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesRelatedAuthorsResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [AuthorSeriesRelationEntity])
  async relatedAuthors(
    @Parent() {id: seriesId}: SeriesEntity,
    @Args({type: () => ResolveSeriesRelatedAuthorsArgs})
    args: ResolveSeriesRelatedAuthorsArgs,
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.relationService.getFromSeries(seriesId, args);
  }
}
