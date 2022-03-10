import { ContentMeta } from "./content-meta.interface";

export interface Location extends ContentMeta{
    name: string;
    streetName: string;
    houseNumber: string;
    zip: string;
    locationName: string;
    geoCoords: {lon: number, lat: number};
    googleMapsLink: string;
    description: string;
}