import IModelState from '@models/interfaces/IModelState';
import IPersisted from '@models/interfaces/IPersisted';
import Image, { ImageCreate } from '@models/media/image.model';

import Streetcode from './streetcode-types.model';

// Базовий інтерфейс для відображення факту
export interface Fact {
  id: number;
  title: string;
  factContent: string;
  imageId: number;
  image?: Image;
  imageDescription?: string;
  order: number;
}

// Для створення нового факту
export interface FactCreate {
  title: string;
  factContent: string;
  imageId: number;
  streetcodeId: number;
  imageDescription?: string;
}

// Для оновлення факту
export interface FactUpdate extends Fact, IModelState, IPersisted {
  streetcodeId?: number;
}

export interface Term {
  id: number;
  title: string;
  description?: string | undefined;
}

export interface RelatedTerm {
  id: number;
  word: string;
  termId: number;
}

export interface Text {
  id: number;
  title: string;
  textContent: string;
  additionalText?: string;
  streetcodeId: number;
  streetcode?: Streetcode | undefined;
  link: string | undefined;
}

export interface TextCreateUpdate extends IModelState {
  id: number;
  title: string | undefined;
  textContent: string | undefined;
  additionalText?: string;
  streetcodeId?: number | null;
}
