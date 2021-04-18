import {Field, ObjectType} from '@nestjs/graphql';
import {AuthorRole} from './roles.enitty';

@ObjectType('Writing')
export class WritingEntity {
  authorId!: string;
  bookId!: string;

  @Field(() => [AuthorRole], {defaultValue: [AuthorRole.AUTHOR]})
  roles?: AuthorRole[];
}
