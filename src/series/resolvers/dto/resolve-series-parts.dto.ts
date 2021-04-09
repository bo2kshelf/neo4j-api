import {ArgsType, Field, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@InputType('SeriesPartsArgsOrderBy')
export class ResolveSeriesPartsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order!: OrderBy;
}

@ArgsType()
export class ResolveSeriesPartsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveSeriesPartsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolveSeriesPartsArgsOrderBy(),
  })
  orderBy!: ResolveSeriesPartsArgsOrderBy;
}

@ObjectType('SeriesPartsReturn')
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
