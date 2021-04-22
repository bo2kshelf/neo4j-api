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
  ResolveAuthorWritesArgs,
  ResolveAuthorWritesReturnEntity,
} from './dto/resolve-authors-writes.dto';

@Resolver(() => AuthorEntity)
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.authorsService.findById(reference.id);
  }

  @ResolveField(() => ResolveAuthorWritesReturnEntity)
  async writed(
    @Parent() {id}: AuthorEntity,
    @Args({type: () => ResolveAuthorWritesArgs}) args: ResolveAuthorWritesArgs,
  ): Promise<ResolveAuthorWritesReturnEntity> {
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
