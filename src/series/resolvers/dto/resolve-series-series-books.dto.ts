import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@ArgsType()
export class SeriesSeriesBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  orderBy!: OrderBy;
}

@ObjectType()
export class SeriesSeriesBooksReturnType {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
