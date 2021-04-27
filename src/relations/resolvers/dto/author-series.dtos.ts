import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {AuthorSeriesRelationEntity} from '../../entities/author-series.entity';

@InputType()
export class AuthorSeriesRelationRelatedBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order!: OrderBy;

  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class AuthorSeriesRelationRelatedBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => AuthorSeriesRelationRelatedBooksArgsOrderBy, {
    nullable: true,
    defaultValue: new AuthorSeriesRelationRelatedBooksArgsOrderBy(),
  })
  orderBy!: AuthorSeriesRelationRelatedBooksArgsOrderBy;
}

@InputType()
export class SeriesRelatedAuthorsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  name!: OrderBy;
}

@ArgsType()
export class SeriesRelatedAuthorsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => SeriesRelatedAuthorsArgsOrderBy, {
    nullable: true,
    defaultValue: new SeriesRelatedAuthorsArgsOrderBy(),
  })
  orderBy!: SeriesRelatedAuthorsArgsOrderBy;
}

@ObjectType()
export class SeriesRelatedAuthorsReturnType {
  @Field(() => [AuthorSeriesRelationEntity])
  nodes!: AuthorSeriesRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}

@InputType()
export class AuthorRelatedSeriesArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class AuthorRelatedSeriesArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => AuthorRelatedSeriesArgsOrderBy, {
    nullable: true,
    defaultValue: new AuthorRelatedSeriesArgsOrderBy(),
  })
  orderBy!: AuthorRelatedSeriesArgsOrderBy;
}

@ObjectType()
export class AuthorRelatedSeriesReturnType {
  @Field(() => [AuthorSeriesRelationEntity])
  nodes!: AuthorSeriesRelationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
