import {ObjectType} from '@nestjs/graphql';

@ObjectType('AuthorSeriesRelation')
export class AuthorSeriesRelationEntity {
  authorId!: string;
  seriesId!: string;
}
