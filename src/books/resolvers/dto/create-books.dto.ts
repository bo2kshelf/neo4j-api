import {ArgsType, Field} from '@nestjs/graphql';

@ArgsType()
export class CreateBookArgs {
  @Field(() => String)
  title!: string;

  @Field(() => String, {nullable: true})
  subtitle?: string;

  @Field(() => String, {nullable: true})
  isbn?: string;
}
