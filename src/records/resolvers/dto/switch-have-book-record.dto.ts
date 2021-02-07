import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SwitchHaveBookRecordArgs {
  @Field(() => ID)
  accountId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  have!: boolean;
}
