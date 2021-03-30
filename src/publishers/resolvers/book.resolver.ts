import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {PublicationEntity} from '../entities/publication.entity';
import {PublishersService} from '../services/publishers.service';
import {BookPublishedByArgs} from './dto/book-published-by.dto';

@Resolver(() => BookEntity)
export class BookResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveField(() => [PublicationEntity])
  async publishedBy(
    @Parent() {id: bookId}: BookEntity,
    @Args({type: () => BookPublishedByArgs}) args: BookPublishedByArgs,
  ): Promise<PublicationEntity[]> {
    return this.publishersService.getPublicationsFromBook(bookId, args);
  }
}
