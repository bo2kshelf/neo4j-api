import {ArgsType, Field, Int} from '@nestjs/graphql';

@ArgsType()
export class AccountReadBooksArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;
}
