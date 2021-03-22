import {ArgsType, Field, ID, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class ResolveBooksOfArgsOrderBy {
  @Field(() => OrderBy, {nullable: true})
  title?: OrderBy;

  @Field(() => OrderBy, {nullable: true})
  volume?: OrderBy;
}

@ArgsType()
export class ResolveBooksOfArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;

  @Field(() => ResolveBooksOfArgsOrderBy, {nullable: true})
  orderBy?: ResolveBooksOfArgsOrderBy;

  @Field(() => [ID]!, {nullable: true})
  except?: string[];
}
