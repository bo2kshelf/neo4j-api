import {Args, Parent, ResolveField, Resolver} from '@nestjs/graphql';
import {BookEntity} from '../../books/entities/book.entity';
import {WritingEntity} from '../entities/writing.entity';
import {AuthorsService} from '../services/authors.service';
import {ResolveBookWritedByArgs} from './dto/resolve-books-writed-by.dto';

@Resolver(() => BookEntity)
export class BooksResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveField(() => [WritingEntity])
  async writedBy(
    @Parent() book: BookEntity,
    @Args({type: () => ResolveBookWritedByArgs}) args: ResolveBookWritedByArgs,
  ): Promise<WritingEntity[]> {
    return this.authorsService.getWritingFromBook(book.id, args);
  }
}
