import {ArgsType, Field} from '@nestjs/graphql';

@ArgsType()
export class CreatePublisherArgs {
  @Field(() => String)
  name!: string;
}
