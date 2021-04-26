import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {AuthorEntity} from '../entities/author.entity';
import {AuthorsService} from '../services/authors.service';
import {GetAuthorArgs} from './dto/get-author.dto';
import {
  ResolveAuthorsWroteBooksArgs,
  ResolveAuthorsWroteBooksReturnEntity,
} from './dto/resolve-authors-wrote-books.dto';

@Resolver(() => AuthorEntity)
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.authorsService.findById(reference.id);
  }

  @ResolveField(() => ResolveAuthorsWroteBooksReturnEntity)
  async wroteBooks(
    @Parent() {id}: AuthorEntity,
    @Args({type: () => ResolveAuthorsWroteBooksArgs})
    args: ResolveAuthorsWroteBooksArgs,
  ): Promise<ResolveAuthorsWroteBooksReturnEntity> {
    return this.authorsService.getWritingFromAuthor(id, args);
  }

  @Query(() => AuthorEntity)
  async author(
    @Args({type: () => GetAuthorArgs}) {id}: GetAuthorArgs,
  ): Promise<AuthorEntity> {
    return this.authorsService.findById(id);
  }

  @Query(() => [AuthorEntity])
  async allAuthors(): Promise<AuthorEntity[]> {
    return this.authorsService.findAll();
  }
}
