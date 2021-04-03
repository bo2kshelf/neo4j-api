import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class SetHaveBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  have!: boolean;
}
