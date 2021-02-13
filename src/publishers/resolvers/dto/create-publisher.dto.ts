import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {ValidateNested} from 'class-validator';

@InputType()
export class CreatePublisherDataInput {
  @Field(() => String)
  name!: string;
}

@ArgsType()
export class CreatePublisherArgs {
  @Field(() => CreatePublisherDataInput)
  @ValidateNested()
  data!: CreatePublisherDataInput;
}
