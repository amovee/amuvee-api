import { ContentMeta } from "./content-meta.interface";
import { Result } from "./result.interface";

export interface Category extends ContentMeta {
    name: string;
    description: string;
    results: Result;
}