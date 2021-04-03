import {Field, GraphQLISODateTime, ObjectType} from '@nestjs/graphql';

@ObjectType('ReadingBookRecord')
export class ReadingBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => Boolean)
  reading!: boolean;

  @Field(() => GraphQLISODateTime)
  updatedAt!: Date;
}
