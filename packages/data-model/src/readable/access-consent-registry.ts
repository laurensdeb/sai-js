import { DataFactory } from 'n3';
import { getAllMatchingQuads } from '@janeirodigital/interop-utils';
import { INTEROP } from '@janeirodigital/interop-namespaces';
import { ReadableResource, ReadableAccessConsent } from '.';
import { AuthorizationAgentFactory } from '..';

export class ReadableAccessConsentRegistry extends ReadableResource {
  factory: AuthorizationAgentFactory;

  async bootstrap(): Promise<void> {
    await this.fetchData();
  }

  public static async build(iri: string, factory: AuthorizationAgentFactory): Promise<ReadableAccessConsentRegistry> {
    const instance = new ReadableAccessConsentRegistry(iri, factory);
    await instance.bootstrap();
    return instance;
  }

  // TODO (elf-pavlik) extract as mixin
  public iriForContained(): string {
    return `${this.iri}${this.factory.randomUUID()}`;
  }

  get accessConsents(): AsyncIterable<ReadableAccessConsent> {
    const accessConsentPattern = [DataFactory.namedNode(this.iri), INTEROP.hasAccessConsent, null, null];
    const accessConsentIris = getAllMatchingQuads(this.dataset, ...accessConsentPattern).map((q) => q.object.value);
    const { factory } = this;
    return {
      async *[Symbol.asyncIterator]() {
        for (const iri of accessConsentIris) {
          yield factory.readable.accessConsent(iri);
        }
      }
    };
  }
}