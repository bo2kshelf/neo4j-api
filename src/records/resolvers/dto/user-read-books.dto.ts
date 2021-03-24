import {ArgsType, Field, InputType, Int} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';

@InputType()
export class UserReadBooksArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.DESC})
  date: OrderBy = OrderBy.DESC;
}

@ArgsType()
export class UserReadBooksArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;

  @Field(() => UserReadBooksArgsOrderBy, {nullable: true})
  orderBy?: UserReadBooksArgsOrderBy;
}
