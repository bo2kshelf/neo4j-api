import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class CreateLabelArgs {
  @Field(() => ID)
  publisherId!: string;

  @Field(() => String)
  name!: string;
}
