import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PublishedPdf {
    id: string;
    originalFileName?: string;
    title: string;
    blob: ExternalBlob;
    authorName: string;
    isSearchable: boolean;
    originalAuthor?: string;
    isPublic: boolean;
}
export interface backendInterface {
    getPdfList(): Promise<Array<PublishedPdf>>;
    getPublished(id: string): Promise<PublishedPdf>;
    publish(blob: ExternalBlob, id: string, authorName: string, title: string, isPublic: boolean, isSearchable: boolean, originalFileName: string | null, originalAuthor: string | null): Promise<string>;
    searchPublished(searchTerm: string): Promise<Array<PublishedPdf>>;
}
