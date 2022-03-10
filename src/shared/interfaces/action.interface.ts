import { ContentMeta } from "./content-meta.interface";

export interface Action extends ContentMeta {
    name: string;
    description: string;
}