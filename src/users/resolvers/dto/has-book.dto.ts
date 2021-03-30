import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class HasBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => Boolean)
  have!: boolean;
}
