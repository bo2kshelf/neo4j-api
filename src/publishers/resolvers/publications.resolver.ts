import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {BooksService} from '../../books/services/books.service';
import {PublicationEntity} from '../entities/publication.entity';
import {PublisherEntity} from '../entities/publisher.entity';
import {PublishersService} from '../services/publishers.service';

@Resolver(() => PublicationEntity)
export class PublicationsResolver {
  constructor(
    private readonly booksService: BooksService,
    private readonly publishersService: PublishersService,
  ) {}

  @ResolveField(() => BookEntity)
  async book(@Parent() {bookId}: PublicationEntity): Promise<BookEntity> {
    return this.booksService.findById(bookId);
  }

  @ResolveField(() => PublisherEntity)
  async publisher(
    @Parent() {publisherId}: PublicationEntity,
  ): Promise<PublisherEntity> {
    return this.publishersService.findById(publisherId);
  }
}
