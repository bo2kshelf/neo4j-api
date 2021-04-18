/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
import {registerEnumType} from '@nestjs/graphql';

export enum AuthorRole {
  AUTHOR = 'AUTHOR',
  ORIGINAL_AUTHOR = 'ORIGINAL_AUTHOR',
  SUPERVISOR = 'SUPERVISOR',
  PARTICIPANT = 'PARTICIPANT',
  EDITOR = 'EDITOR',
  ILLUSTRATOR = 'ILLUSTRATOR',
  COMIC_ARTIST = 'COMIC_ARTIST',
  TRANSLATOR = 'TRANSLATOR',
  TRANSLATE_SUPERVISOR = 'TRANSLATE_SUPERVISOR',
}
registerEnumType(AuthorRole, {name: 'AuthorRole'});
