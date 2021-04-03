import {ArgsType, Field, ID} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';

@ArgsType()
export class ReadBookArgs {
  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  bookId!: string;

  @Field(() => LocalDateResolver, {nullable: true, defaultValue: undefined})
  readAt?: string;
}
