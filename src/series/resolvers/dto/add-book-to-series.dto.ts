import {ArgsType, Field, Float, ID} from '@nestjs/graphql';

@ArgsType()
export class AddBookToSeriesArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  seriesId!: string;

  @Field(() => Float, {nullable: true})
  order?: number;

  @Field(() => String, {nullable: true})
  displayAs?: string;
}
