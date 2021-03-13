import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SwitchWishReadBookRecordArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  wish!: boolean;
}
