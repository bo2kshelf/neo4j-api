import {Field, ObjectType} from '@nestjs/graphql';

@ObjectType('Writing')
export class WritingEntity {
  authorId!: string;
  bookId!: string;

  @Field(() => [String])
  roles!: string[];
}
