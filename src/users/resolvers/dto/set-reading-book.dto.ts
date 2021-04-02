import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SetReadingBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  reading!: boolean;
}
