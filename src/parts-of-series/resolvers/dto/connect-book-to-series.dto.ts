import {ArgsType, Field, Float, ID} from '@nestjs/graphql';

@ArgsType()
export class ConnectBookToSeriesArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  seriesId!: string;

  @Field(() => Float, {nullable: true})
  volume?: number;
}
