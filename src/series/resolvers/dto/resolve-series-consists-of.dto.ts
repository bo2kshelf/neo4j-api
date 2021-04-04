import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {SeriesPartEntity} from '../../entities/series-part.entity';

@InputType('SeriesConsistsOfArgsOrderBy')
export class ResolveSeriesConsistsOfArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order: OrderBy = OrderBy.ASC;

  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title: OrderBy = OrderBy.ASC;
}

@ArgsType()
export class ResolveSeriesConsistsOfArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => ResolveSeriesConsistsOfArgsOrderBy, {
    nullable: true,
  })
  orderBy: ResolveSeriesConsistsOfArgsOrderBy = new ResolveSeriesConsistsOfArgsOrderBy();

  @Field(() => [ID!], {nullable: true})
  except: string[] = [];
}

@ObjectType('SeriesConsistsOfReturn')
export class ResolveSeriesConsistsOfReturnEntity {
  @Field(() => [SeriesPartEntity])
  nodes!: SeriesPartEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
