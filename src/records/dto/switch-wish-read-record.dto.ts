import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SwitchWishReadRecordArgs {
  @Field(() => ID)
  accountId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  wish!: boolean;
}
