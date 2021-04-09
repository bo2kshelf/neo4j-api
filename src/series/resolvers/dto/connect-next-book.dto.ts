import {ArgsType, Field, ID, ObjectType} from '@nestjs/graphql';

@ArgsType()
export class ConnectNextBookArgs {
  @Field(() => ID)
  previousId!: string;

  @Field(() => ID)
  nextId!: string;
}

@ObjectType('ConnectNextBookReturn')
export class ConnectNextBookReturn {
  previousId!: string;
  nextId!: string;
}
