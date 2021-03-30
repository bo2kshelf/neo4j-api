import {ArgsType, Field, ID, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class ResolveSeriesPartsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  order: OrderBy = OrderBy.ASC;
}

@ArgsType()
export class ResolveSeriesPartsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip = 0;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit = 0;

  @Field(() => ResolveSeriesPartsArgsOrderBy, {
    nullable: true,
  })
  orderBy: ResolveSeriesPartsArgsOrderBy = new ResolveSeriesPartsArgsOrderBy();

  @Field(() => [ID!], {nullable: true})
  except: string[] = [];
}
