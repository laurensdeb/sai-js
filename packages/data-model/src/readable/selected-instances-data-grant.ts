import { DatasetCore } from '@rdfjs/types';
import { Memoize } from 'typescript-memoize';
import { InheritableDataGrant, InheritInstancesDataGrant } from '.';
import { InteropFactory, DataInstance } from '..';

export class SelectedInstancesDataGrant extends InheritableDataGrant {
  canCreate = false;

  public static async build(
    iri: string,
    factory: InteropFactory,
    dataset: DatasetCore
  ): Promise<SelectedInstancesDataGrant> {
    const instance = new SelectedInstancesDataGrant(iri, factory, dataset);
    await instance.bootstrap();
    return instance;
  }

  getDataInstanceIterator(): AsyncIterable<DataInstance> {
    const { factory } = this;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const dataGrant = this;
    return {
      async *[Symbol.asyncIterator]() {
        for (const instanceIri of dataGrant.hasDataInstance) {
          yield factory.dataInstance(instanceIri, dataGrant);
        }
      }
    };
  }

  @Memoize()
  get hasDataInstance(): string[] {
    return this.getObjectsArray('hasDataInstance').map((object) => object.value);
  }
}
