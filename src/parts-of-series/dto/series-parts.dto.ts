import {ArgsType, Field, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../common/order-by.enum';

@InputType()
export class SeriesPartsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true})
  title?: OrderBy;

  @Field(() => OrderBy, {nullable: true})
  volume?: OrderBy;
}

@ArgsType()
export class SeriesPartsArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;

  @Field(() => SeriesPartsArgsOrderBy, {nullable: true})
  orderBy?: SeriesPartsArgsOrderBy;
}
