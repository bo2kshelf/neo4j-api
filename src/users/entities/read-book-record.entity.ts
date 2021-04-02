import {Field, ObjectType} from '@nestjs/graphql';
import {LocalDateResolver} from 'graphql-scalars';

@ObjectType('ReadBookRecord')
export class ReadBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => LocalDateResolver, {nullable: true})
  recentReadAt!: string;
}
