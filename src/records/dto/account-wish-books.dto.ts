import {ArgsType, Field, Int} from '@nestjs/graphql';

@ArgsType()
export class AccountWishBooksArgs {
  @Field(() => Int, {nullable: true})
  skip?: number;

  @Field(() => Int, {nullable: true})
  limit?: number;
}
