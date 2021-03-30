import {ArgsType, Field, Int} from '@nestjs/graphql';

@ArgsType()
export class ResolveUserReadingBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip = 0;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit = 0;
}
