import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SetWishReadBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  wish!: boolean;
}
