import {ObjectType} from '@nestjs/graphql';

@ObjectType('PublisherLabelRelation')
export class PublisherLabelRelationEntity {
  labelId!: string;
  publisherId!: string;
}
