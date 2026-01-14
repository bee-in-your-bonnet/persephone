import type { Schemas } from '../types';
import type { Persephone } from './persephone';

export class VersionBuilder {
  private persephone: Persephone;
  private _version: number;

  constructor(persephone: Persephone, version: number) {
    this.persephone = persephone;
    this._version = version;
  }

  get version(): number {
    return this._version;
  }

  schema(schemas: Schemas): Persephone {
    this.persephone._setSchemas(schemas);
    return this.persephone;
  }
}

