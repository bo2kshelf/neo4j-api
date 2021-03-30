import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {PublicationEntity} from '../entities/publication.entity';
import {PublisherEntity} from '../entities/publisher.entity';
import {PublishersService} from '../services/publishers.service';
import {CreatePublisherArgs} from './dto/create-publisher.dto';
import {GetPublisherArgs} from './dto/get-publisher.dto';
import {ConnectBookToPublisherArgs} from './dto/published-book.dto';
import {ResolvePublicationsArgs} from './dto/resolve-publisher-publications.dto';

@Resolver(() => PublisherEntity)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.publishersService.findById(reference.id);
  }

  @ResolveField(() => [PublicationEntity])
  async publications(
    @Parent() {id: publisherId}: PublisherEntity,
    @Args({type: () => ResolvePublicationsArgs})
    args: ResolvePublicationsArgs,
  ): Promise<PublicationEntity[]> {
    return this.publishersService.getPublicationsFromPublisher(
      publisherId,
      args,
    );
  }

  @Query(() => PublisherEntity)
  async publisher(
    @Args({type: () => GetPublisherArgs})
    {id}: GetPublisherArgs,
  ): Promise<PublisherEntity> {
    return this.publishersService.findById(id);
  }

  @Query(() => [PublisherEntity])
  async allPublishers(): Promise<PublisherEntity[]> {
    return this.publishersService.findAll();
  }

  @Mutation(() => PublisherEntity)
  async createPublisher(
    @Args({type: () => CreatePublisherArgs})
    {data}: CreatePublisherArgs,
  ): Promise<PublisherEntity> {
    return this.publishersService.create(data);
  }

  @Mutation(() => PublicationEntity)
  async publishedBook(
    @Args({type: () => ConnectBookToPublisherArgs})
    args: ConnectBookToPublisherArgs,
  ): Promise<PublicationEntity> {
    return this.publishersService.connectBookToPublisher(args);
  }
}
