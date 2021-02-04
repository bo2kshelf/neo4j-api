import {
  Args,
  Mutation,
  Query,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import {AuthorEntity} from './author.entity';
import {AuthorsService} from './authors.service';
import {CreateAuthorArgs} from './dto/create-author.dto';
import {GetAuthorArgs} from './dto/get-author.dto';

@Resolver('Author')
export class AuthorsResolver {
  constructor(private readonly authorsService: AuthorsService) {}

  @ResolveReference()
  resolveReference(reference: {__typename: string; id: string}) {
    return this.authorsService.findById(reference.id);
  }

  @Query(() => AuthorEntity)
  async author(
    @Args({type: () => GetAuthorArgs}) {id}: GetAuthorArgs,
  ): Promise<AuthorEntity> {
    return this.authorsService.findById(id);
  }

  @Query(() => [AuthorEntity])
  async allAuthors(): Promise<AuthorEntity[]> {
    return this.authorsService.findAllAuthors();
  }

  @Mutation(() => [AuthorEntity])
  async createAuthor(
    @Args({type: () => CreateAuthorArgs}) {data}: CreateAuthorArgs,
  ): Promise<AuthorEntity> {
    return this.authorsService.createAuthor(data);
  }
}
