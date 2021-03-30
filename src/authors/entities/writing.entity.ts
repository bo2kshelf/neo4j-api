import {Field, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/book.entity';
import {AuthorEntity} from './author.entity';

@ObjectType('Writing')
export class WritingEntity {
  @Field(() => AuthorEntity)
  author!: AuthorEntity;

  @Field(() => BookEntity)
  book!: BookEntity;

  @Field(() => [String], {nullable: true})
  roles?: string[];
}
