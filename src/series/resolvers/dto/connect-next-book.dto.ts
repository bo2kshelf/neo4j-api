import {ArgsType, Field, ID} from '@nestjs/graphql';

@ArgsType()
export class ConnectNextBookArgs {
  @Field(() => ID)
  previousId!: string;

  @Field(() => ID)
  nextId!: string;
}
