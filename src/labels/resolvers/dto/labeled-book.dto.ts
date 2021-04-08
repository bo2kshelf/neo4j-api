import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class LabeledBookArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  labelId!: string;
}
