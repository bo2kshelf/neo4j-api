import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {PublicationEntity} from '../publisher.entity';
import {PublishersService} from '../publishers.service';
import {BookPublishedByArgs} from './dto/book-published-by.dto';

@Resolver(() => BookEntity)
export class BookPublishedByResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveField(() => [PublicationEntity])
  async publishedBy(
    @Parent() book: BookEntity,
    @Args({type: () => BookPublishedByArgs}) args: BookPublishedByArgs,
  ): Promise<PublicationEntity[]> {
    return this.publishersService.getPublicationsFromBook(book, args);
  }
}
