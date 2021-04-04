import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {AuthorSeriesRelationEntity} from '../../entities/author-series.entity';

@InputType('AuthorSeriesRelationRelatedBooksArgsOrderBy')
export class ResolveAuthorSeriesRelationRelatedBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order!: OrderBy;

  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveAuthorSeriesRelationRelatedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveAuthorSeriesRelationRelatedBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveAuthorSeriesRelationRelatedBooksArgsOrderBy(),
  })
  orderBy!: ResolveAuthorSeriesRelationRelatedBooksArgsOrderBy;
}

@InputType('SeriesRelatedAuthorsArgsOrderBy')
export class ResolveSeriesRelatedAuthorsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class ResolveSeriesRelatedAuthorsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveSeriesRelatedAuthorsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveSeriesRelatedAuthorsArgsOrderBy(),
  })
  orderBy!: ResolveSeriesRelatedAuthorsArgsOrderBy;
}

@ObjectType('SeriesRelatedAuthorsReturn')
export class ResolveSeriesRelatedAuthorsReturn {
  @Field(() => [AuthorSeriesRelationEntity])
  nodes!: AuthorSeriesRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}

@InputType('AuthorsRelatedSeriesArgsOrderBy')
export class ResolveAuthorsRelatedSeriesArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolveAuthorsRelatedSeriesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveAuthorsRelatedSeriesArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveAuthorsRelatedSeriesArgsOrderBy(),
  })
  orderBy!: ResolveAuthorsRelatedSeriesArgsOrderBy;
}

@ObjectType('AuthorsRelatedSeriesReturn')
export class ResolveAuthorsRelatedSeriesReturn {
  @Field(() => [AuthorSeriesRelationEntity])
  nodes!: AuthorSeriesRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
