import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class ConnectBookToPublisherArgs {
  @Field(() => ID)
  bookId!: string;

  @Field(() => ID)
  publisherId!: string;
}
