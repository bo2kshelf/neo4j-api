import {ArgsType, Field, InputType} from '@nestjs/graphql';
import {ValidateNested} from 'class-validator';

@InputType()
export class CreateBookDataInput {
  @Field(() => String)
  title!: string;

  @Field(() => String, {nullable: true})
  subtitle?: string;

  @Field(() => String, {nullable: true})
  isbn?: string;
}

@ArgsType()
export class CreateBookArgs {
  @Field(() => CreateBookDataInput)
  @ValidateNested()
  data!: CreateBookDataInput;
}
