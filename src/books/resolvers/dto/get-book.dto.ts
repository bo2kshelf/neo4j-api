import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class GetBookArgs {
  @Field(() => ID)
  id!: string;
}
