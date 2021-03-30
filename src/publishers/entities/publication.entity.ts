import {Field, ObjectType} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {PublisherEntity} from './publisher.entity';

@ObjectType('Publication')
export class PublicationEntity {
  @Field(() => PublisherEntity)
  publisher!: PublisherEntity;

  @Field(() => BookEntity)
  book!: BookEntity;
}
