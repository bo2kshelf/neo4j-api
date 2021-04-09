import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class CreateSeriesArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => String)
  title!: string;
}
