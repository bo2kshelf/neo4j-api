import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@InputType()
export class ResolveSeriesPartsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order: OrderBy = OrderBy.ASC;

  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title: OrderBy = OrderBy.ASC;
}

@ArgsType()
export class ResolveSeriesPartsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveSeriesPartsArgsOrderBy, {
    nullable: true,
  })
  orderBy: ResolveSeriesPartsArgsOrderBy = new ResolveSeriesPartsArgsOrderBy();

  @Field(() => [ID!], {nullable: true})
  except: string[] = [];
}

@ObjectType('SeriesPartsReturn')
export class ResolveSeriesPartsReturnEntity {
  @Field(() => [SeriesPartEntity])
  parts!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Int)
  skip!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
