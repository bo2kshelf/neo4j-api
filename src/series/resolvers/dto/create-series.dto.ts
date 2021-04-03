import {ArgsType, Field} from '@nestjs/graphql';

@ArgsType()
export class CreateSeriesArgs {
  @Field(() => String)
  title!: string;
}
