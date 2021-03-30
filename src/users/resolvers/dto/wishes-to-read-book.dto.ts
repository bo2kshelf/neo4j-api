import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class WishesToReadBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  wish!: boolean;
}
