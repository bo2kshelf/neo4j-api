import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {ValidateNested} from 'class-validator';

@InputType()
export class CreateSeriesDataInput {
  @Field(() => String)
  title!: string;

  @Field(() => String, {nullable: true})
  isbn?: string;
}

@ArgsType()
export class CreateSeriesArgs {
  @Field(() => CreateSeriesDataInput)
  @ValidateNested()
  data!: CreateSeriesDataInput;
}
