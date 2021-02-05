import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SwitchReadingRecordArgs {
  @Field(() => ID)
  accountId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  reading!: boolean;
}
