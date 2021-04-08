import {Field, ID, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  @Field(() => ID)
  id!: string;

  userId!: string;
  bookId!: string;

  @Field(() => [LocalDateResolver])
  readAt!: string[];

  @Field(() => LocalDateResolver, {nullable: true})
  latestReadAt!: string;
}
