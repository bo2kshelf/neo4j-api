import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class GetPublisherArgs {
  @Field(() => ID)
  id!: string;
}
