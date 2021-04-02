import {ObjectType} from '@nestjs/graphql';

@ObjectType('Publication')
export class PublicationEntity {
  publisherId!: string;
  bookId!: string;
}
