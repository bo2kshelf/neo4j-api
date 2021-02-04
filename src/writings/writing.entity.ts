import {Field, ObjectType} from '@nestjs/graphql';
import {AuthorEntity} from '../authors/author.entity';
import {BookEntity} from '../books/book.entity';

@ObjectType('Writing')
export class WritingEntity {
  @Field(() => AuthorEntity)
  author!: AuthorEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => [String], {nullable: false})
  roles?: string[];
}
