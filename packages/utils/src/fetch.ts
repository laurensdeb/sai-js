import { DatasetCore } from '@rdfjs/types';
import { serializeTurtle, parseTurtle } from '.';

export interface RdfRequestInit extends RequestInit {
  dataset?: DatasetCore;
}

export interface RdfResponse extends Response {
  dataset(): Promise<DatasetCore>;
}

type WhatwgFetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>;
export type RdfFetch = (iri: string, options?: RdfRequestInit) => Promise<RdfResponse>;

// TODO accept either string | NamedNode
// https://github.com/janeirodigital/sai-js/issues/17
async function unwrappedRdfFetch(
  whatwgFetch: WhatwgFetch,
  iri: string,
  options?: RdfRequestInit
): Promise<RdfResponse> {
  let requestInit: RequestInit;
  if (options?.dataset) {
    const { dataset, ...request } = options;
    request.body = await serializeTurtle(options.dataset);
    request.headers = { 'Content-Type': 'text/turtle', ...request.headers };
    requestInit = request;
  } else {
    requestInit = { ...options } as RequestInit;
    requestInit.headers = { Accept: 'text/turtle', ...requestInit.headers };
  }
  const response = await whatwgFetch(iri, requestInit);
  const rdfResponse = { ...response } as RdfResponse;
  // TODO (elf-pavlik) check if Content-Type is text/turtle
  // https://github.com/janeirodigital/sai-js/issues/18
  rdfResponse.dataset = async function dataset() {
    // TODO (elf-pavlik) set graph name
    // https://github.com/janeirodigital/sai-js/issues/19
    return parseTurtle(await response.text());
  };
  return rdfResponse;
}

export function fetchWrapper(whatwgFetch: WhatwgFetch): RdfFetch {
  return function wrappedRdfFetch(iri: string, options?: RdfRequestInit) {
    return unwrappedRdfFetch(whatwgFetch, iri, options);
  };
}