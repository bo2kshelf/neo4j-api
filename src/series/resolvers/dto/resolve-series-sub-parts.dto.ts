import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@InputType('SeriesSubSubPartsArgsOrderBy')
export class ResolveSeriesSubPartsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order!: OrderBy;
}

@ArgsType()
export class ResolveSeriesSubPartsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveSeriesSubPartsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveSeriesSubPartsArgsOrderBy(),
  })
  orderBy!: ResolveSeriesSubPartsArgsOrderBy;
}

@ObjectType('SeriesSubPartsReturn')
export class ResolveSeriesPartsReturnEntity {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
