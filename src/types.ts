export type ItemStatus = 'stored' | 'out';

export type Item = {
  id: string;
  name: string;
  aliases: string[];
  locationId: string;
  locationDetail?: string;
  photoId?: string;
  note?: string;
  tags: string[];
  status: ItemStatus;
  takenOutAt?: number;
  locationVerifiedAt: number;
  createdAt: number;
  updatedAt: number;
};

export type Location = {
  id: string;
  name: string;
  parentId?: string;
  photoId?: string;
  createdAt: number;
};

export type Photo = {
  id: string;
  blob: Blob;
  createdAt: number;
};

export type SearchLog = {
  id: string;
  query: string;
  hitCount: number;
  resolved: boolean;
  searchedAt: number;
};

export type MetaKey = 'lastExportAt';
