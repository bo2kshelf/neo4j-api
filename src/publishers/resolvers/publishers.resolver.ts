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
import {
  PublishersPublicationsReturnEntity,
  ResolvePublishersPublicationsArgs,
} from './dto/resolve-publishers-publications.dto';

@Resolver(() => PublisherEntity)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.publishersService.findById(reference.id);
  }

  @ResolveField(() => PublishersPublicationsReturnEntity)
  async publications(
    @Parent() {id: publisherId}: PublisherEntity,
    @Args({type: () => ResolvePublishersPublicationsArgs})
    args: ResolvePublishersPublicationsArgs,
  ): Promise<PublishersPublicationsReturnEntity> {
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
    args: CreatePublisherArgs,
  ): Promise<PublisherEntity> {
    return this.publishersService.create(args);
  }

  @Mutation(() => PublicationEntity)
  async publishedBook(
    @Args({type: () => ConnectBookToPublisherArgs})
    args: ConnectBookToPublisherArgs,
  ): Promise<PublicationEntity> {
    return this.publishersService.publishedBook(args);
  }
}
