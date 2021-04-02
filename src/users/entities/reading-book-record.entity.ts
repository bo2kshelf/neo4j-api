import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType('ReadingBookRecord')
export class ReadingBookRecordEntity {
  userId!: string;
  bookId!: string;

  @Field(() => Boolean)
  reading!: boolean;
}
