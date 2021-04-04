import {ArgsType, Field, ID, InputType, Int, ObjectType} from '@nestjs/graphql';
import {OrderBy} from '../../../common/order-by.enum';
import {PublicationEntity} from '../../entities/publication.entity';

@InputType('PublishersPublicationsArgsOrderBy')
export class ResolvePublishersPublicationsArgsOrderBy {
  @Field(() => OrderBy, {nullable: true, defaultValue: OrderBy.ASC})
  title!: OrderBy;
}

@ArgsType()
export class ResolvePublishersPublicationsArgs {
  @Field(() => Int, {nullable: true, defaultValue: 0})
  skip!: number;

  @Field(() => Int, {nullable: true, defaultValue: 0})
  limit!: number;

  @Field(() => [ID!], {nullable: true, defaultValue: []})
  except!: string[];

  @Field(() => ResolvePublishersPublicationsArgsOrderBy, {
    nullable: true,
    defaultValue: new ResolvePublishersPublicationsArgsOrderBy(),
  })
  orderBy!: ResolvePublishersPublicationsArgsOrderBy;
}

@ObjectType('PublishersPublicationsReturn')
export class PublishersPublicationsReturnEntity {
  @Field(() => [PublicationEntity])
  nodes!: PublicationEntity[];

  @Field(() => Int)
  count!: number;

  @Field(() => Boolean)
  hasPrevious!: boolean;

  @Field(() => Boolean)
  hasNext!: boolean;
}
