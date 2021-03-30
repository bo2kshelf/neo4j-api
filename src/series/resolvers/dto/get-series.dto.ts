import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class GetSeriesArgs {
  @Field(() => ID)
  id!: string;
}
