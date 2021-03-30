import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/entities/author.entity';
import {BookEntity} from '../books/book.entity';
import {SeriesEntity} from '../series/series.entity';
import {AuthorSeriesRelationEntity} from './author-series-relation.entity';
import {AuthorSeriesRelationsService} from './author-series-relations.service';
import {AuthorRelatedSeriesArgs} from './dto/author-related-series.dto';
import {AuthorSeriesRelationRelatedBooksArgs} from './dto/related-books.dto';
import {SeriesRelatedAuthorsArgs} from './dto/series-related-authors.dto';

@Resolver(() => AuthorSeriesRelationEntity)
export class AuthorSeriesRelationResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [BookEntity])
  async relatedBooks(
    @Parent() {series, author}: AuthorSeriesRelationEntity,
    @Args({type: () => AuthorSeriesRelationRelatedBooksArgs})
    args: AuthorSeriesRelationRelatedBooksArgs,
  ): Promise<BookEntity[]> {
    return this.relationService.getRelatedBooks({series, author}, args);
  }
}

@Resolver(() => AuthorEntity)
export class AuthorRelatedSeriesResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [AuthorSeriesRelationEntity])
  async relatedSeries(
    @Parent() author: AuthorEntity,
    @Args({type: () => AuthorRelatedSeriesArgs})
    args: AuthorRelatedSeriesArgs,
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.relationService.getFromAuthor(author, args);
  }
}

@Resolver(() => SeriesEntity)
export class SeriesRelatedAuthorsResolver {
  constructor(private readonly relationService: AuthorSeriesRelationsService) {}

  @ResolveField(() => [AuthorSeriesRelationEntity])
  async relatedAuthors(
    @Parent() series: SeriesEntity,
    @Args({type: () => SeriesRelatedAuthorsArgs})
    args: SeriesRelatedAuthorsArgs,
  ): Promise<AuthorSeriesRelationEntity[]> {
    return this.relationService.getFromSeries(series, args);
  }
}
