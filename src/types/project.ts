import { MaterialSettings, ProductId } from './product';

export interface ProjectRecord {
  id: string;
  name: string;
  thumbnail: string;
  productType: ProductId | string;
  garmentColor: string;
  materialSettings: MaterialSettings;
  canvases: Record<string, string>; // zoneId -> JSON string of fabric canvas
  createdAt: number;
  updatedAt: number;
}

export interface HistoryEntry {
  zoneId: string;
  canvasJson: string;
  garmentColor: string;
  materialSettings: MaterialSettings;
}
