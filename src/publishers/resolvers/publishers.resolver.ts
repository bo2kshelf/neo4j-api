import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {PublicationEntity, PublisherEntity} from '../publisher.entity';
import {PublishersService} from '../publishers.service';
import {CreatePublisherArgs} from './dto/create-publisher.dto';
import {GetPublisherArgs} from './dto/get-publisher.dto';
import {ResolvePublicationsArgs} from './dto/resolve-publications.dto';

@Resolver(() => PublisherEntity)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.publishersService.getPublisherById(reference.id);
  }

  @ResolveField(() => [PublicationEntity])
  async publications(
    @Parent() publisher: PublisherEntity,
    @Args({type: () => ResolvePublicationsArgs})
    args: ResolvePublicationsArgs,
  ): Promise<PublicationEntity[]> {
    return this.publishersService.getPublicationsFromPublisher(publisher, args);
  }

  @Query(() => PublisherEntity)
  async publisher(
    @Args({type: () => GetPublisherArgs}) {id}: GetPublisherArgs,
  ): Promise<PublisherEntity> {
    return this.publishersService.getPublisherById(id);
  }

  @Query(() => [PublisherEntity])
  async allPublishers(): Promise<PublisherEntity[]> {
    return this.publishersService.getAllPublishers();
  }

  @Mutation(() => PublisherEntity)
  async createPublisher(
    @Args({type: () => CreatePublisherArgs}) {data}: CreatePublisherArgs,
  ): Promise<PublisherEntity> {
    return this.publishersService.createPublisher(data);
  }
}
