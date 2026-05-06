export type PosterLayout = {
  namePosition: { x: number; y: number };
  credentialsPosition: { x: number; y: number };
  hospitalPosition: { x: number; y: number };
  cityPosition: { x: number; y: number };
  doctorImagePosition: { x: number; y: number; width: number; height: number };
};

export type Poster = {
  _id: string;
  name: string;
  templateImageUrl: string;
  textColorHex: string;
  isActive: boolean;
  layout: PosterLayout;
};
