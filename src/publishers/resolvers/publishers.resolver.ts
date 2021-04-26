import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {PublisherEntity} from '../entities/publisher.entity';
import {PublishersService} from '../services/publishers.service';
import {GetPublisherArgs} from './dto/get-publisher.dto';
import {
  PublisherPublishedBooksArgs,
  PublisherPublishedBooksReturnType,
} from './dto/resolve-publisher-published-books.dto';

@Resolver(() => PublisherEntity)
export class PublishersResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.publishersService.findById(reference.id);
  }

  @ResolveField(() => PublisherPublishedBooksReturnType)
  async publishedBooks(
    @Parent() {id: publisherId}: PublisherEntity,
    @Args({type: () => PublisherPublishedBooksArgs})
    args: PublisherPublishedBooksArgs,
  ): Promise<PublisherPublishedBooksReturnType> {
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
}
