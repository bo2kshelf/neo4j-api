import {ArgsType, Field, Int, ObjectType} from '@nestjs/graphql';
import {ReadingBookRecordEntity} from '../../entities/reading-book-record.entity';

@ArgsType()
export class ResolveUsersReadingBooksArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;
}

@ObjectType('UsersReadingBooksReturn')
export class ResolveUsersReadingBooksReturnEntity {
  @Field(() => [ReadingBookRecordEntity])
  records!: ReadingBookRecordEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
