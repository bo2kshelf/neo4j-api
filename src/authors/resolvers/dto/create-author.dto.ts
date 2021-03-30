import {ArgsType, Field} from '@nestjs/graphql';

@ArgsType()
export class CreateAuthorArgs {
  @Field(() => String)
  name!: string;
}
