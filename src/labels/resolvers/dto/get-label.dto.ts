import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class GetLabelArgs {
  @Field(() => ID)
  id!: string;
}
