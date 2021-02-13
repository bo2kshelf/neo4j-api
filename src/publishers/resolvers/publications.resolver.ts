import {Args, Mutation, Resolver} from '@nestjs/graphql';
import {PublicationEntity} from '../publisher.entity';
import {PublishersService} from '../publishers.service';
import {ConnectBookToPublisherArgs} from './dto/connect-book-to-publisher.dto';

@Resolver(() => PublicationEntity)
export class PublicationsResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @Mutation(() => PublicationEntity)
  async connectBookToPublisher(
    @Args({type: () => ConnectBookToPublisherArgs})
    {bookId, publisherId}: ConnectBookToPublisherArgs,
  ): Promise<PublicationEntity> {
    return this.publishersService.connectBookToPublisher({
      bookId,
      publisherId,
    });
  }
}
