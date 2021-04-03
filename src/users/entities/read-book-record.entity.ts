import {Field, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => [LocalDateResolver])
  readAt!: string[];

  @Field(() => LocalDateResolver, {nullable: true})
  latestReadAt!: string;
}
