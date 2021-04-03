import {ObjectType} from '@nestjs/graphql';

@ObjectType('StackedBookRecord')
export class StackedBookRecordEntity {
  userId!: string;
  bookId!: string;
}
