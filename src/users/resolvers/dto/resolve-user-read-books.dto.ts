import {ArgsType, Field, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class ResolveUserReadBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  date: OrderBy = OrderBy.DESC;
}

@ArgsType()
export class ResolveUserReadBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip = 0;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit = 0;

  @Field(() => ResolveUserReadBooksArgsOrderBy, {nullable: true})
  orderBy?: ResolveUserReadBooksArgsOrderBy;
}
