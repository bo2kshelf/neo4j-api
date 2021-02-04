import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {ValidateNested} from 'class-validator';

@InputType()
export class CreateAuthorDataInput {
  @Field(() => String)
  name!: string;
}

@ArgsType()
export class CreateAuthorArgs {
  @Field(() => CreateAuthorDataInput)
  @ValidateNested()
  data!: CreateAuthorDataInput;
}
