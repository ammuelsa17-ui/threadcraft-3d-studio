export interface ActiveObjectTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  opacity: number;
  isGroup: boolean;
  groupCount?: number;
}

export interface TypographyState {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string | number;
  fontStyle: string;
  textAlign: string;
  charSpacing: number;
  lineHeight: number;
  underline: boolean;
  linethrough: boolean;
  uppercase: boolean;
  shadowColor?: string;
  shadowBlur?: number;
}

export interface LayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  previewText?: string;
  zIndex: number;
}
