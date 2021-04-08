import {Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {PublisherEntity} from '../entities/publisher.entity';
import {PublishersService} from '../services/publishers.service';

@Resolver(() => BookEntity)
export class BookResolver {
  constructor(private readonly publishersService: PublishersService) {}

  @ResolveField(() => PublisherEntity, {nullable: true})
  async publishedBy(
    @Parent() {id: bookId}: BookEntity,
  ): Promise<PublisherEntity | null> {
    const id = await this.publishersService.getPublisherIdFromBook(bookId);
    return id ? this.publishersService.findById(id) : null;
  }
}
